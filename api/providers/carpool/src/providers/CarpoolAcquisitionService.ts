import { NotFoundException, provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { CarpoolEventRepository } from '../repositories/CarpoolEventRepository';
import { CarpoolRepository } from '../repositories/CarpoolRepository';
import { CarpoolAcquisitionEvent } from '../events';
import { CarpoolRequestRepository } from '../repositories/CarpoolRequestRepository';
import { CarpoolLookupRepository } from '../repositories/CarpoolLookupRepository';
import { CancelRequest, CarpoolAcquisitionStatusEnum, RegisterRequest, UpdateRequest } from '../interfaces';

@provider()
export class CarpoolAcquisitionService {
  constructor(
    protected connection: PostgresConnection,
    protected eventRepository: CarpoolEventRepository,
    protected requestRepository: CarpoolRequestRepository,
    protected lookupRepository: CarpoolLookupRepository,
    protected carpoolRepository: CarpoolRepository,
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
      await this.eventRepository.syncStatus(carpool._id, conn);
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
      await this.eventRepository.syncStatus(carpool._id, conn);
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
      await this.eventRepository.syncStatus(carpool._id, conn);
      await conn.query('COMMIT');
    } catch (e) {
      await conn.query('ROLLBACK');
      throw e;
    } finally {
      conn.release();
    }
  }
}
