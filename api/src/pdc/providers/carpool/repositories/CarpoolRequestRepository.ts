import { provider } from "@/ilos/common/index.ts";
import { LegacyPostgresConnection, PoolClient } from "@/ilos/connection-postgres/index.ts";
import sql, { join, raw } from "@/lib/pg/sql.ts";
import { DatabaseException } from "../exceptions/DatabaseException.ts";
import { InsertableCarpoolRequest, WrittenCarpoolRequest } from "../interfaces/index.ts";

@provider()
export class CarpoolRequestRepository {
  readonly table = "carpool_v2.requests";

  constructor(protected connection: LegacyPostgresConnection) {}

  public async save(
    data: InsertableCarpoolRequest,
    client?: PoolClient,
  ): Promise<WrittenCarpoolRequest> {
    const cl = client ?? this.connection.getClient();
    const sqlQuery = sql`
      INSERT INTO ${raw(this.table)} (
        carpool_id, operator_id, operator_journey_id, payload, api_version, ${
      raw(
        "created_at" in data ? "created_at, " : "",
      )
    } cancel_code, cancel_message
      ) VALUES (
        ${
      join([
        data.carpool_id,
        data.operator_id,
        data.operator_journey_id,
        "payload" in data ? JSON.stringify(data.payload) : null,
        data.api_version,
        ...("created_at" in data ? [data.created_at] : []),
        "cancel_code" in data ? data.cancel_code : null,
        "cancel_message" in data ? data.cancel_message : null,
      ])
    }
      )
      RETURNING _id, created_at
    `;
    const result = await cl.query<WrittenCarpoolRequest>(sqlQuery);
    const request = result.rows.pop();
    if (!request) {
      throw new DatabaseException();
    }
    return request;
  }
}
