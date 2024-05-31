import { provider } from '@ilos/common/index.ts';
import { PostgresConnection } from '@ilos/connection-postgres/index.ts';

@provider()
export class GetOldestTripDateRepositoryProvider {
  public readonly table = 'trip.list';

  constructor(public connection: PostgresConnection) {}

  public async call(): Promise<Date> {
    const result = await this.connection
      .getClient()
      .query(`SELECT journey_start_datetime FROM ${this.table} ORDER BY journey_start_datetime ASC LIMIT 1`);
    return result.rows[0].journey_start_datetime;
  }
}
