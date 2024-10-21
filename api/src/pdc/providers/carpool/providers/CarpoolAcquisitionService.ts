import { NotFoundException, provider } from "@/ilos/common/index.ts";
import { PoolClient, PostgresConnection } from "@/ilos/connection-postgres/index.ts";
import { addMinutes, differenceInHours } from "@/lib/date/index.ts";
import { env_or_false } from "@/lib/env/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { endOfDay, startOfDay } from "@/pdc/helpers/dates.helper.ts";
import { GeoProvider } from "@/pdc/providers/geo/index.ts";
import { CancelRequest, CarpoolAcquisitionStatusEnum, RegisterRequest, UpdateRequest } from "../interfaces/index.ts";
import { CarpoolGeoRepository } from "../repositories/CarpoolGeoRepository.ts";
import { CarpoolLookupRepository } from "../repositories/CarpoolLookupRepository.ts";
import { CarpoolRepository } from "../repositories/CarpoolRepository.ts";
import { CarpoolRequestRepository } from "../repositories/CarpoolRequestRepository.ts";
import { CarpoolStatusRepository } from "../repositories/CarpoolStatusRepository.ts";
import { CarpoolAcquisitionStatus } from "../status/index.ts";

@provider()
export class CarpoolAcquisitionService {
  constructor(
    protected connection: PostgresConnection,
    protected statusRepository: CarpoolStatusRepository,
    protected requestRepository: CarpoolRequestRepository,
    protected lookupRepository: CarpoolLookupRepository,
    protected carpoolRepository: CarpoolRepository,
    protected geoRepository: CarpoolGeoRepository,
    protected geoService: GeoProvider,
  ) {}

  public async verifyTermsViolation(data: {
    operator_id: number;
    created_at: Date;
    distance: number;
    driver_identity_key: string;
    passenger_identity_key: string;
    start_datetime: Date;
    end_datetime: Date;
    operator_trip_id: string;
  }, client?: PoolClient): Promise<Array<string>> {
    const result = [];
    // The journey has been sent too late
    if (differenceInHours(data.created_at, data.start_datetime) > 24) {
      result.push("expired");
    }

    if (data.distance < 2_000) {
      result.push("distance_too_short");
    }

    // This select all distinct operator_trip_id that started in the same day
    // with the same identity key as any role
    const journeyCount = await this.lookupRepository.countJourneyBy({
      operator_id: data.operator_id,
      identity_key: [data.driver_identity_key, data.passenger_identity_key],
      start_date: {
        min: startOfDay(data.start_datetime),
        max: endOfDay(data.start_datetime),
      },
    }, client);
    if (journeyCount >= 4) {
      result.push("too_many_trips_by_day");
    }

    // This select all distinct operator_trip_id that started before
    // 30 minutes after the end of the current trip OR ended after
    // 30 minutes before the start of the current trip
    const journeyCloseCount = await this.lookupRepository.countJourneyBy({
      operator_id: data.operator_id,
      identity_key: [data.driver_identity_key, data.passenger_identity_key],
      start_date: { min: data.start_datetime, max: addMinutes(data.end_datetime, 30) },
      end_date: { min: addMinutes(data.start_datetime, -30), max: data.end_datetime },
      operator_trip_id: data.operator_trip_id,
    }, client);
    if (journeyCloseCount >= 1) {
      result.push("too_close_trips");
    }

    return result;
  }

  public async registerRequest(
    data: RegisterRequest,
  ): Promise<
    { created_at: Date; terms_violation_error_labels: Array<string> }
  > {
    const conn = await this.connection.getClient().connect();
    await conn.query("BEGIN");
    try {
      const { api_version, ...carpoolData } = data;
      const carpool = await this.carpoolRepository.register(carpoolData, conn);
      const request = await this.requestRepository.save(
        {
          api_version,
          carpool_id: carpool._id,
          operator_id: data.operator_id,
          operator_journey_id: data.operator_journey_id,
          payload: carpoolData,
        },
        conn,
      );
      let terms_violation_error_labels: Array<string> = [];
      if (env_or_false("APP_DISABLE_TERMS_VALIDATION")) {
        await this.statusRepository.saveAcquisitionStatus(
          new CarpoolAcquisitionStatus(
            carpool._id,
            request._id,
            CarpoolAcquisitionStatusEnum.Received,
          ),
          conn,
        );
      } else {
        terms_violation_error_labels = await this.verifyTermsViolation({
          operator_id: data.operator_id,
          created_at: carpool.created_at,
          distance: data.distance,
          driver_identity_key: data.driver_identity_key,
          passenger_identity_key: data.passenger_identity_key,
          operator_trip_id: data.operator_trip_id,
          start_datetime: data.start_datetime,
          end_datetime: data.end_datetime,
        }, conn);

        await this.statusRepository.saveAcquisitionStatus(
          new CarpoolAcquisitionStatus(
            carpool._id,
            request._id,
            terms_violation_error_labels.length
              ? CarpoolAcquisitionStatusEnum.TermsViolationError
              : CarpoolAcquisitionStatusEnum.Received,
          ),
          conn,
        );

        if (terms_violation_error_labels.length) {
          await this.statusRepository.setTermsViolationErrorLabels(
            carpool._id,
            terms_violation_error_labels,
            conn,
          );
        }
      }

      await conn.query("COMMIT");
      return {
        terms_violation_error_labels,
        created_at: carpool.created_at,
      };
    } catch (e) {
      await conn.query("ROLLBACK");
      throw e;
    } finally {
      conn.release();
    }
  }

  public async updateRequest(data: UpdateRequest): Promise<void> {
    const conn = await this.connection.getClient().connect();
    await conn.query("BEGIN");
    try {
      const { api_version, operator_id, operator_journey_id, ...carpoolData } = data;
      const carpool = await this.carpoolRepository.update(
        operator_id,
        operator_journey_id,
        carpoolData,
        conn,
      );
      const request = await this.requestRepository.save(
        {
          api_version,
          operator_id,
          operator_journey_id,
          carpool_id: carpool._id,
          payload: carpoolData,
        },
        conn,
      );

      await this.statusRepository.saveAcquisitionStatus(
        new CarpoolAcquisitionStatus(
          carpool._id,
          request._id,
          CarpoolAcquisitionStatusEnum.Updated,
        ),
        conn,
      );
      await conn.query("COMMIT");
    } catch (e) {
      await conn.query("ROLLBACK");
      throw e;
    } finally {
      conn.release();
    }
  }

  public async cancelRequest(data: CancelRequest): Promise<void> {
    const conn = await this.connection.getClient().connect();
    await conn.query("BEGIN");
    try {
      const carpool = await this.lookupRepository.findOneStatus(
        data.operator_id,
        data.operator_journey_id,
      );
      if (!carpool) {
        throw new NotFoundException();
      }
      const request = await this.requestRepository.save(
        {
          ...data,
          carpool_id: carpool._id,
        },
        conn,
      );
      await this.statusRepository.saveAcquisitionStatus(
        new CarpoolAcquisitionStatus(
          carpool._id,
          request._id,
          CarpoolAcquisitionStatusEnum.Canceled,
        ),
        conn,
      );
      await conn.query("COMMIT");
    } catch (e) {
      await conn.query("ROLLBACK");
      throw e;
    } finally {
      conn.release();
    }
  }

  public async processGeo(
    search: { batchSize: number; from: Date; to: Date; failedOnly: boolean },
  ): Promise<number> {
    const conn = await this.connection.getClient().connect();
    try {
      const toProcess = await this.geoRepository.findProcessable(
        {
          limit: search.batchSize,
          from: search.from,
          to: search.to,
          failedOnly: search.failedOnly,
        },
        conn,
      );
      for (const toEncode of toProcess) {
        try {
          const start = await this.geoService.positionToInsee(toEncode.start);
          const end = await this.geoService.positionToInsee(toEncode.end);
          await this.geoRepository.upsert(
            {
              carpool_id: toEncode.carpool_id,
              start_geo_code: start,
              end_geo_code: end,
            },
            conn,
          );
          await this.statusRepository.saveAcquisitionStatus(
            {
              carpool_id: toEncode.carpool_id,
              status: CarpoolAcquisitionStatusEnum.Processed,
            },
            conn,
          );
        } catch (e) {
          await this.geoRepository.upsert({
            carpool_id: toEncode.carpool_id,
            error: e.message,
          }, conn);
          await this.statusRepository.saveAcquisitionStatus(
            {
              carpool_id: toEncode.carpool_id,
              status: CarpoolAcquisitionStatusEnum.Failed,
            },
            conn,
          );
          logger.error(
            `[geo] error encoding ${toEncode.carpool_id} : ${e.message}`,
          );
        }
      }
      return toProcess.length;
    } finally {
      conn.release();
    }
  }
}
