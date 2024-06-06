import { NotFoundException, provider } from '@/ilos/common/index.ts';
import { PostgresConnection } from '@/ilos/connection-postgres/index.ts';
import { CarpoolStatusRepository } from '../repositories/CarpoolStatusRepository.ts';
import { CarpoolRepository } from '../repositories/CarpoolRepository.ts';
import { CarpoolAcquisitionStatus } from '../status/index.ts';
import { CarpoolRequestRepository } from '../repositories/CarpoolRequestRepository.ts';
import { CarpoolLookupRepository } from '../repositories/CarpoolLookupRepository.ts';
import { CancelRequest, CarpoolAcquisitionStatusEnum, RegisterRequest, UpdateRequest } from '../interfaces/index.ts';
import { CarpoolGeoRepository } from '../repositories/CarpoolGeoRepository.ts';
import { GeoProvider } from '@/pdc/providers/geo/index.ts';

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
      await this.statusRepository.saveAcquisitionStatus(
        new CarpoolAcquisitionStatus(carpool._id, request._id, CarpoolAcquisitionStatusEnum.Received),
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
      await this.statusRepository.saveAcquisitionStatus(
        new CarpoolAcquisitionStatus(carpool._id, request._id, CarpoolAcquisitionStatusEnum.Updated),
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
      await this.statusRepository.saveAcquisitionStatus(
        new CarpoolAcquisitionStatus(carpool._id, request._id, CarpoolAcquisitionStatusEnum.Canceled),
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

  public async processGeo(search: { batchSize: number; from: Date; to: Date; failedOnly: boolean }): Promise<number> {
    const conn = await this.connection.getClient().connect();
    try {
      const toProcess = await this.geoRepository.findProcessable(
        { limit: search.batchSize, from: search.from, to: search.to, failedOnly: search.failedOnly },
        conn,
      );
      for (const toEncode of toProcess) {
        try {
          const start = await this.geoService.positionToInsee(toEncode.start);
          const end = await this.geoService.positionToInsee(toEncode.end);
          await this.geoRepository.upsert(
            { carpool_id: toEncode.carpool_id, start_geo_code: start, end_geo_code: end },
            conn,
          );
          await this.statusRepository.saveAcquisitionStatus(
            { carpool_id: toEncode.carpool_id, status: CarpoolAcquisitionStatusEnum.Processed },
            conn,
          );
        } catch (e) {
          await this.geoRepository.upsert({ carpool_id: toEncode.carpool_id, error: e.message }, conn);
          await this.statusRepository.saveAcquisitionStatus(
            { carpool_id: toEncode.carpool_id, status: CarpoolAcquisitionStatusEnum.Failed },
            conn,
          );
          console.error(`[geo] error encoding ${toEncode.carpool_id} : ${e.message}`);
        }
      }
      return toProcess.length;
    } finally {
      conn.release();
    }
  }
}
