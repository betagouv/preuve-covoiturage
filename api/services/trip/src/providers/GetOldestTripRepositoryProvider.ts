import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres/dist';

@provider()
export class GetOldestTripDateRepositoryProvider {
  public readonly table = 'trip.list';

  constructor(public connection: PostgresConnection) {}

  public async call(): Promise<Date> {
    const result = await this.connection
      .getClient()
      .query('SELECT journey_start_datetime FROM trip.list ORDER BY journey_start_datetime ASC LIMIT 1');
    return result.rows[0].journey_start_datetime;
  }
}
