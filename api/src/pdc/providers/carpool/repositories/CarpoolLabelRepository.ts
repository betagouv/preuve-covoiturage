import { provider } from "@/ilos/common/index.ts";
import {
  PoolClient,
  PostgresConnection,
} from "@/ilos/connection-postgres/index.ts";
import sql, { raw } from "../helpers/sql.ts";
import { CarpoolLabel } from "../interfaces/database/label.ts";

@provider()
export class CarpoolLabelRepository {
  readonly carpoolTable = "carpool_v2.carpools";
  readonly fraudTable = "fraudcheck.labels";
  readonly anomalyTable = "anomaly.labels";

  constructor(protected connection: PostgresConnection) {}

  async findFraudByOperatorJourneyId(
    operator_id: number,
    operator_journey_id: string,
    client?: PoolClient,
  ): Promise<Array<CarpoolLabel>> {
    const cclient = client ?? this.connection.getClient();
    const query = sql`
        SELECT fl.label
        FROM ${raw(this.fraudTable)} fl
        JOIN ${raw(this.carpoolTable)} cc
          ON cc._id = fl.carpool_id
        WHERE 
          cc.operator_id = ${operator_id}
          AND cc.operator_journey_id = ${operator_journey_id}
    `;
    const result = await cclient.query(query);
    return result.rows;
  }

  async findAnomalyByOperatorJourneyId(
    operator_id: number,
    operator_journey_id: string,
    client?: PoolClient,
  ): Promise<Array<CarpoolLabel>> {
    const cclient = client ?? this.connection.getClient();
    const query = sql`
        SELECT
          al.label,
          al.conflicting_operator_journey_id,
          al.overlap_duration_ratio
        FROM ${raw(this.anomalyTable)} al
        JOIN ${raw(this.carpoolTable)} cc
          ON cc._id = al.carpool_id
        WHERE 
          cc.operator_id = ${operator_id}
          AND cc.operator_journey_id = ${operator_journey_id}
    `;
    const result = await cclient.query(query);
    return result.rows.map(({ label, ...metas }) => ({ label, metas }));
  }
}
