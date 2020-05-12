import { PostgresConnection } from '@ilos/connection-postgres';
import { provider } from '@ilos/common';

import { CheckInterface } from '../../interfaces/CheckInterface';
import { FraudCheckResult } from '../../interfaces';
import { step } from '../helpers/math';

interface TripDatetimeParamsInterface {
  start_delta: number;
}

@provider()
export class TripDatetimeInconsistencyCheck implements CheckInterface<TripDatetimeParamsInterface> {
  public static readonly key: string = 'tripDatetimeInconsistencyCheck';
  protected readonly min = 300; // 5 minutes MIN
  protected readonly max = 21600; // 6 hours MAX

  constructor(protected connection: PostgresConnection) {}

  async prepare(acquisitionId: number): Promise<TripDatetimeParamsInterface[]> {
    const query = {
      text: `
        WITH data AS(
          SELECT
            datetime
          FROM carpool.carpools
          WHERE trip_id = ANY(
            SELECT
              trip_id
            FROM carpool.carpools
            WHERE acquisition_id = $1::int
          )
          AND is_driver = true
        )
        SELECT
          EXTRACT(
            EPOCH FROM (
              MAX(datetime) - MIN(datetime)
            )::interval
          )::int AS start_delta
        FROM data
      `,
      values: [acquisitionId],
    };

    const dbResult = await this.connection.getClient().query(query);
    return [dbResult.rows.pop()];
  }

  async handle(data: TripDatetimeParamsInterface): Promise<FraudCheckResult> {
    return step(data.start_delta, this.min, this.max);
  }
}
