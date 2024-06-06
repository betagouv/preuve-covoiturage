import { provider } from '/ilos/common/index.ts';
import { PoolClient, PostgresConnection } from '/ilos/connection-postgres/index.ts';
import sql, { raw } from '../helpers/sql.ts';
import { Id, InsertableCarpoolAcquisitionStatus } from '../interfaces/index.ts';

@provider()
export class CarpoolStatusRepository {
  readonly table = 'carpool_v2.status';

  constructor(protected connection: PostgresConnection) {}

  public async saveIncentiveStatus(data: unknown, client?: PoolClient): Promise<void> {
    throw new Error();
  }
  public async saveFraudStatus(data: unknown, client?: PoolClient): Promise<void> {
    throw new Error();
  }

  public async saveAcquisitionStatus(data: InsertableCarpoolAcquisitionStatus, client?: PoolClient): Promise<void> {
    await this.setStatus(data.carpool_id, 'acquisition', data.status, client);
  }

  public async setStatus(
    carpool_id: Id,
    statusType: 'acquisition' | 'fraud',
    statusValue: string,
    client?: PoolClient,
  ): Promise<void> {
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
