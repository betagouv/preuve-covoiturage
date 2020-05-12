import { PostgresConnection } from '@ilos/connection-postgres';
import { provider } from '@ilos/common';

import { CheckInterface } from '../../interfaces/CheckInterface';
import { FraudCheckResult } from '../../interfaces';
import { step } from '../helpers/math';

interface TripDriverIdentityParamsInterface {
  distinct_driver_uuid: number;
}

@provider()
export class TripDriverIdentityInconsistencyCheck implements CheckInterface<TripDriverIdentityParamsInterface> {
  public static readonly key: string = 'tripDriverIdentityInconsistencyCheck';
  protected readonly min = 1;
  protected readonly max = 2;

  constructor(protected connection: PostgresConnection) {}

  async prepare(acquisitionId: number): Promise<TripDriverIdentityParamsInterface[]> {
    const query = {
      text: `
        WITH data AS (
          SELECT
            count(distinct id.uuid) as distinct_driver_uuid
          FROM carpool.carpools AS cc
          JOIN carpool.identities AS id
          ON 
            cc.identity_id = id._id
          WHERE
            cc.trip_id = ANY(
              SELECT
                trip_id
              FROM carpool.carpools
              WHERE acquisition_id = $1::int
            ) 
            AND cc.is_driver = true
          GROUP BY id.uuid
        )
        SELECT
          sum(distinct_driver_uuid) as distinct_driver_uuid
        FROM data
      `,
      values: [acquisitionId],
    };

    const dbResult = await this.connection.getClient().query(query);
    return [dbResult.rows.pop()];
  }

  async handle(data: TripDriverIdentityParamsInterface): Promise<FraudCheckResult> {
    return step(data.distinct_driver_uuid, this.min, this.max);
  }
}
