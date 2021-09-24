import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres/dist';

@provider()
export class TripOperatorRepositoryProvider {
  public readonly table = 'trip.list';

  constructor(public connection: PostgresConnection) {}

  public async getInvoledOperators(campaign_id: number, start_date: Date, end_date: Date): Promise<number[]> {
    const result = await this.connection.getClient().query({
      text: `SELECT distinct operator_id
      FROM ${this.table}
      WHERE JOURNEY_START_DATETIME >= $1::TIMESTAMP
        AND JOURNEY_START_DATETIME <= $2::TIMESTAMP
        AND $3 = ANY(APPLIED_POLICIES);`,
      values: [start_date, end_date, campaign_id],
    });
    return result.rowCount ? result.rows.map((r) => r.operator_id) : [];
  }
}
