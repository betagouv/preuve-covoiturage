import { provider } from "@/ilos/common/index.ts";
import {
  PoolClient,
  PostgresConnection,
} from "@/ilos/connection-postgres/index.ts";
import sql, { raw } from "../helpers/sql.ts";
import { CarpoolLabel } from "../interfaces/database/label.ts";

// TODO : test

@provider()
export class CarpoolLabelRepository {
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
        SELECT label
        FROM ${raw(this.fraudTable)}
        WHERE 
          operator_id = ${operator_id}
          AND operator_journey_id = ${operator_journey_id}
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
          label,
          conflicting_operator_journey_id,
          overlap_duration_ratio
        FROM ${raw(this.anomalyTable)}
        WHERE 
          operator_id = ${operator_id}
          AND operator_journey_id = ${operator_journey_id}
    `;
    const result = await cclient.query(query);
    return result.rows.map(({ label, ...meta }) => ({ label, meta }));
  }
}
