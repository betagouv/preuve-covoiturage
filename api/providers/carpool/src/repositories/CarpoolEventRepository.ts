import { provider } from '@ilos/common';
import { PoolClient, PostgresConnection } from '@ilos/connection-postgres';
import sql, { raw } from '../helpers/sql';
import { Id, InsertableCarpoolAcquisitionEvent } from '../interfaces';

@provider()
export class CarpoolEventRepository {
  readonly acquisitionEventTable = 'carpool_v2.acquisition_events';
  readonly incentiveEventTable = 'carpool_v2.incentive_events';
  readonly fraudEventTable = 'carpool_v2.fraud_events';

  readonly statusTable = 'carpool_v2.status';

  constructor(protected connection: PostgresConnection) {}

  public async saveIncentiveEvent(data: unknown, client?: PoolClient): Promise<void> {
    throw new Error();
  }
  public async saveFraudEvent(data: unknown, client?: PoolClient): Promise<void> {
    throw new Error();
  }

  public async saveAcquisitionEvent(data: InsertableCarpoolAcquisitionEvent, client?: PoolClient): Promise<void> {
    const cl = client ?? this.connection.getClient();
    const sqlQuery = sql`
      INSERT INTO ${raw(this.acquisitionEventTable)} (carpool_id, request_id, status)
      VALUES (${data.carpool_id}, ${data.request_id}, ${data.status})
    `;
    await cl.query(sqlQuery);
  }

  public async syncStatus(carpool_id: Id, client?: PoolClient): Promise<void> {
    const cl = client ?? this.connection.getClient();
    const sqlQuery = sql`
      WITH 
      latest_acquisition AS (
          SELECT
            _id,
            status
          FROM ${raw(this.acquisitionEventTable)}
          WHERE carpool_id = ${carpool_id}
          ORDER BY created_at DESC
          LIMIT 1
      ),
      latest_incentive AS (
          SELECT
            _id,
            status
          FROM ${raw(this.incentiveEventTable)}
          WHERE carpool_id = ${carpool_id}
          ORDER BY created_at DESC
          LIMIT 1
      ),
      latest_fraud AS (
          SELECT
            _id,
            status
          FROM ${raw(this.fraudEventTable)}
          WHERE carpool_id = ${carpool_id}
          ORDER BY created_at DESC
          LIMIT 1
      )
      INSERT INTO ${raw(this.statusTable)} (
        carpool_id,
        acquisition_last_event_id,
        acquisition_status,
        incentive_last_event_id,
        incentive_status,
        fraud_last_event_id,
        fraud_status
      ) VALUES (
        ${carpool_id},
        (SELECT _id FROM latest_acquisition),
        COALESCE((SELECT status FROM latest_acquisition), 'received'),
        (SELECT _id FROM latest_incentive),
        COALESCE((SELECT status FROM latest_incentive), 'pending'),
        (SELECT _id FROM latest_fraud),
        COALESCE((SELECT status FROM latest_fraud), 'pending')
      )
      ON CONFLICT (carpool_id)
      DO UPDATE 
      SET 
          acquisition_last_event_id = excluded.acquisition_last_event_id,
          acquisition_status = excluded.acquisition_status,
          incentive_last_event_id = excluded.incentive_last_event_id,
          incentive_status = excluded.incentive_status,
          fraud_last_event_id = excluded.fraud_last_event_id,
          fraud_status = excluded.fraud_status
      WHERE status.carpool_id = ${carpool_id}
    `;
    await cl.query(sqlQuery);
  }
}
