import { provider } from '@ilos/common';
import { PoolClient, PostgresConnection } from '@ilos/connection-postgres';
import { InsertableCarpoolRequest, WrittenCarpoolRequest } from '../interfaces';
import sql, { raw } from '../helpers/sql';

@provider()
export class CarpoolRequestRepository {
  readonly table = 'carpool_v2.requests';

  constructor(protected connection: PostgresConnection) {}

  public async save(data: InsertableCarpoolRequest, client?: PoolClient): Promise<WrittenCarpoolRequest> {
    const cl = client ?? this.connection.getClient();
    const sqlQuery = sql`
      INSERT INTO ${raw(this.table)} (
        carpool_id, operator_id, operator_journey_id, payload, api_version, cancel_code, cancel_message
      ) VALUES (
        ${data.carpool_id},
        ${data.operator_id},
        ${data.operator_journey_id},
        ${'payload' in data ? JSON.stringify(data.payload) : null},
        ${data.api_version},
        ${'cancel_code' in data ? data.cancel_code : null},
        ${'cancel_message' in data ? data.cancel_message : null}
      )
      RETURNING _id, created_at
    `;
    const result = await cl.query<WrittenCarpoolRequest>(sqlQuery);
    return result.rows.pop();
  }
}
