import { provider } from '@ilos/common';
import { PoolClient, PostgresConnection } from '@ilos/connection-postgres';
import sql, { raw } from '../helpers/sql';
import { Id, InsertableCarpoolAcquisitionEvent } from '../interfaces';

@provider()
export class CarpoolEventRepository {
  readonly table = 'carpool_v2.status';

  constructor(protected connection: PostgresConnection) {}

  public async saveIncentiveEvent(data: unknown, client?: PoolClient): Promise<void> {
    throw new Error();
  }
  public async saveFraudEvent(data: unknown, client?: PoolClient): Promise<void> {
    throw new Error();
  }

  public async saveAcquisitionEvent(data: InsertableCarpoolAcquisitionEvent, client?: PoolClient): Promise<void> {
    await this.setStatus(data.carpool_id, 'acquisition', data.status, client);
  }

  protected async setStatus(carpool_id: Id, statusType: string, statusValue: string, client?: PoolClient): Promise<void> {
    const cl = client ?? this.connection.getClient();
    const sqlQuery = sql`
      INSERT INTO ${raw(this.table)} (
        carpool_id,
        ${raw(statusType)}_status
      ) VALUES (
        ${carpool_id},
        ${statusValue}
      )
      ON CONFLICT (carpool_id)
      DO UPDATE 
      SET 
          ${raw(statusType)}_status = excluded.${raw(statusType)}_status
      WHERE status.carpool_id = ${carpool_id}
    `;
    await cl.query(sqlQuery);
  }
}
