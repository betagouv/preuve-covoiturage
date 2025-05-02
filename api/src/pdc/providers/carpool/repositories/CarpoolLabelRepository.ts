import { provider } from "@/ilos/common/index.ts";
import { LegacyPostgresConnection, PoolClient } from "@/ilos/connection-postgres/index.ts";
import sql, { raw } from "@/lib/pg/sql.ts";
import { CarpoolLabel } from "../interfaces/database/label.ts";

@provider()
export class CarpoolLabelRepository {
  readonly carpoolTable = "carpool_v2.carpools";
  readonly fraudTable = "fraudcheck.labels";
  readonly anomalyTable = "anomaly.labels";
  readonly termsTable = "carpool_v2.terms_violation_error_labels";

  constructor(protected connection: LegacyPostgresConnection) {}

  async findTermsByOperatorJourneyId(
    operator_id: number,
    operator_journey_id: string,
    client?: PoolClient,
  ): Promise<Array<CarpoolLabel>> {
    const cclient = client ?? this.connection.getClient();
    const query = sql`
        SELECT cl.labels
        FROM ${raw(this.termsTable)} cl
        JOIN ${raw(this.carpoolTable)} cc
          ON cc._id = cl.carpool_id
        WHERE 
          cc.operator_id = ${operator_id}
          AND cc.operator_journey_id = ${operator_journey_id}
    `;
    const result = await cclient.query<{ labels: Array<string> }>(query);
    return result.rows.pop()?.labels.map((l: string) => ({ label: l })) || [];
  }

  async findFraudByOperatorJourneyId(
    api_version: string,
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
    if (result.rowCount == 0) {
      return [];
    }
    // >= "3.1" or "3.1.0"
    return result.rows.map(({ label }) => ({ label: label }));
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
