import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { CarpoolEventRepository } from '../repositories/CarpoolEventRepository';
import { CarpoolRepository } from '../repositories/CarpoolRepository';
import { CarpoolRequestCanceledEvent, CarpoolRequestReceivedEvent, CarpoolRequestUpdatedEvent } from '../events';
import { CarpoolRequestRepository } from '../repositories/CarpoolRequestRepository';
import { CarpoolLookupRepository } from '../repositories/CarpoolLookupRepository';

@provider()
export class CarpoolRequestService {
  constructor(
    protected connection: PostgresConnection,
    protected eventRepository: CarpoolEventRepository,
    protected requestRepository: CarpoolRequestRepository,
    protected lookupRepository: CarpoolLookupRepository,
    protected carpoolRepository: CarpoolRepository,
  ) {}

  public async registerRequest(data: any): Promise<void> {
    const conn = await this.connection.getClient().connect();
    await conn.query('BEGIN');
    try {
      const carpool = await this.carpoolRepository.register(data, conn);
      const request = await this.requestRepository.save(data, conn);
      await this.eventRepository.save(new CarpoolRequestReceivedEvent(carpool._id, request._id));
      await conn.query('COMMIT');
    } catch (e) {
      await conn.query('ROLLBACK');
      throw e;
    } finally {
      conn.release();
    }
  }

  public async updateRequest(data: any): Promise<void> {
    const conn = await this.connection.getClient().connect();
    await conn.query('BEGIN');
    try {
      const carpool = await this.carpoolRepository.update(data.operator_id, data.operator_journey_id, data, conn);
      const request = await this.requestRepository.save(data, conn);
      await this.eventRepository.save(new CarpoolRequestUpdatedEvent(carpool._id, request._id));
      await conn.query('COMMIT');
    } catch (e) {
      await conn.query('ROLLBACK');
      throw e;
    } finally {
      conn.release();
    }
  }

  public async cancelRequest(data: any): Promise<void> {
    const conn = await this.connection.getClient().connect();
    await conn.query('BEGIN');
    try {
      const carpool = await this.lookupRepository.findOne(data.operator_id, data.operator_journey_id);
      const request = await this.requestRepository.save(data, conn);
      await this.eventRepository.save(new CarpoolRequestCanceledEvent(carpool._id, request._id));
      await conn.query('COMMIT');
    } catch (e) {
      await conn.query('ROLLBACK');
      throw e;
    } finally {
      conn.release();
    }
  }
}
