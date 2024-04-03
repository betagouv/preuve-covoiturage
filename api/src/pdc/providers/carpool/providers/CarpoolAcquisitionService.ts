import { NotFoundException, provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { CarpoolEventRepository } from '../repositories/CarpoolEventRepository';
import { CarpoolRepository } from '../repositories/CarpoolRepository';
import { CarpoolAcquisitionEvent } from '../events';
import { CarpoolRequestRepository } from '../repositories/CarpoolRequestRepository';
import { CarpoolLookupRepository } from '../repositories/CarpoolLookupRepository';
import { CancelRequest, CarpoolAcquisitionStatusEnum, RegisterRequest, UpdateRequest } from '../interfaces';
import { CarpoolGeoRepository } from '../repositories/CarpoolGeoRepository';
import { GeoProvider } from '@pdc/providers/geo';

@provider()
export class CarpoolAcquisitionService {
  constructor(
    protected connection: PostgresConnection,
    protected eventRepository: CarpoolEventRepository,
    protected requestRepository: CarpoolRequestRepository,
    protected lookupRepository: CarpoolLookupRepository,
    protected carpoolRepository: CarpoolRepository,
    protected geoRepository: CarpoolGeoRepository,
    protected geoService: GeoProvider,
  ) {}

  public async registerRequest(data: RegisterRequest): Promise<void> {
    const conn = await this.connection.getClient().connect();
    await conn.query('BEGIN');
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
      await this.eventRepository.saveAcquisitionEvent(
        new CarpoolAcquisitionEvent(carpool._id, request._id, CarpoolAcquisitionStatusEnum.Received),
        conn,
      );
      await conn.query('COMMIT');
    } catch (e) {
      await conn.query('ROLLBACK');
      throw e;
    } finally {
      conn.release();
    }
  }

  public async updateRequest(data: UpdateRequest): Promise<void> {
    const conn = await this.connection.getClient().connect();
    await conn.query('BEGIN');
    try {
      const { api_version, operator_id, operator_journey_id, ...carpoolData } = data;
      const carpool = await this.carpoolRepository.update(operator_id, operator_journey_id, carpoolData, conn);
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
      await this.eventRepository.saveAcquisitionEvent(
        new CarpoolAcquisitionEvent(carpool._id, request._id, CarpoolAcquisitionStatusEnum.Updated),
        conn,
      );
      await conn.query('COMMIT');
    } catch (e) {
      await conn.query('ROLLBACK');
      throw e;
    } finally {
      conn.release();
    }
  }

  public async cancelRequest(data: CancelRequest): Promise<void> {
    const conn = await this.connection.getClient().connect();
    await conn.query('BEGIN');
    try {
      const carpool = await this.lookupRepository.findOneStatus(data.operator_id, data.operator_journey_id);
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
      await this.eventRepository.saveAcquisitionEvent(
        new CarpoolAcquisitionEvent(carpool._id, request._id, CarpoolAcquisitionStatusEnum.Canceled),
        conn,
      );
      await conn.query('COMMIT');
    } catch (e) {
      await conn.query('ROLLBACK');
      throw e;
    } finally {
      conn.release();
    }
  }

  public async processGeo(search: { batchSize: number; from: Date; to: Date }): Promise<boolean> {
    const conn = await this.connection.getClient().connect();
    try {
      const toProcess = await this.geoRepository.findProcessable({ limit: search.batchSize, from: search.from, to: search.to }, conn);
      for (const toEncode of toProcess) {
        try {
          const start = await this.geoService.positionToInsee(toEncode.start);
          const end = await this.geoService.positionToInsee(toEncode.end);
          await this.geoRepository.upsert({ carpool_id: toEncode.carpool_id, start_geo_code: start, end_geo_code: end }, conn)
        } catch (e) {
          await this.geoRepository.upsert({ carpool_id: toEncode.carpool_id, error: e.message}, conn);
          console.error(`[geo] ${e.message}`);
        }
      }
      return toProcess.length === search.batchSize;
    } finally {
      conn.release();
    }
  }
}
