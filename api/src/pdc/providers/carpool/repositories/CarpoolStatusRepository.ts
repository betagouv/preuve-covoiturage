import { provider } from "@/ilos/common/index.ts";
import {
  PoolClient,
  PostgresConnection,
} from "@/ilos/connection-postgres/index.ts";
import { join } from "@/pdc/providers/carpool/helpers/sql.ts";
import { OperatorJourneyId } from "@/shared/cee/common/CeeApplicationInterface.ts";
import sql, { raw } from "../helpers/sql.ts";
import { CarpoolStatus } from "../interfaces/database/label.ts";
import { Id, InsertableCarpoolAcquisitionStatus } from "../interfaces/index.ts";

@provider()
export class CarpoolStatusRepository {
  readonly table = "carpool_v2.status";
  readonly carpoolTable = "carpool_v2.carpools";

  constructor(protected connection: PostgresConnection) {}

  public async saveAcquisitionStatus(
    data: InsertableCarpoolAcquisitionStatus,
    client?: PoolClient,
  ): Promise<void> {
    await this.setStatus(data.carpool_id, "acquisition", data.status, client);
  }

  public async setStatus(
    carpool_id: Id,
    statusType: "acquisition",
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

  public async getStatusByOperatorJourneyId(
    operator_id: Id,
    operator_journey_id: OperatorJourneyId,
    client?: PoolClient,
  ): Promise<CarpoolStatus & { created_at: Date } | undefined> {
    const cl = client ?? this.connection.getClient();
    const sqlQuery = sql`
      SELECT
        cs.acquisition_status,
        cs.fraud_status,
        cs.anomaly_status,
        cc.created_at
      FROM ${raw(this.table)} cs
      JOIN ${raw(this.carpoolTable)} cc
        ON cc._id = cs.carpool_id
      WHERE
        cc.operator_id = ${operator_id}
        AND cc.operator_journey_id = ${operator_journey_id}
    `;
    const result = await cl.query(sqlQuery);
    return result.rows[0];
  }

  public async getOperatorJourneyIdByStatus(data: {
    operator_id: number;
    status: Array<Partial<CarpoolStatus>>;
    start: Date;
    end: Date;
    limit: number;
    offset: number;
  }): Promise<Array<{ operator_journey_id: string }>> {
    const result = await this.connection.getClient().query(sql`
      SELECT
        cc.operator_journey_id
      FROM ${raw(this.table)} cs
      JOIN ${raw(this.carpoolTable)} cc
        ON cc._id = cs.carpool_id
      WHERE
        cc.operator_id = ${data.operator_id}
        AND cc.start_datetime >= ${data.start}
        AND cc.start_datetime < ${data.end}
        AND (${
      join(
        data.status.map((s) =>
          join(
            Object.keys(s).filter((k) =>
              k in s && s[k as keyof typeof s] !== undefined
            ).map((
              k,
            ) => sql`${raw(k)} = ${s[k as keyof typeof s]}`),
            " AND ",
          )
        ),
        " OR ",
      )
    })
      LIMIT ${data.limit}
      OFFSET ${data.offset}
    `);
    return result.rows;
  }
}
