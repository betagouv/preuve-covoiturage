import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { PrepareCheckInterface } from '../../interfaces';
import { TripIdentityCheckParamsInterface } from './tripIdentity/TripIdentityCheckParamsInterface';

@provider()
export class TripIdentityCheckPreparator implements PrepareCheckInterface<TripIdentityCheckParamsInterface> {
  constructor(private connection: PostgresConnection) {}

  async prepare(acquisitionId: number): Promise<TripIdentityCheckParamsInterface[]> {
    const query = {
      text: `
        SELECT
          id.phone::varchar,
          id.phone_trunc::varchar,
          cc.operator_id::varchar,
          id.operator_user_id::varchar,
          id.firstname::varchar,
          id.lastname::varchar,
          id.email::varchar,
          id.travel_pass_name::varchar,
          id.travel_pass_user_id::varchar
        FROM carpool.carpools AS tr
        JOIN carpool.carpools AS cc
          ON cc.trip_id = tr.trip_id
        JOIN carpool.identities AS id
          ON cc.identity_id = id._id
        WHERE
          tr.acquisition_id = $1::int
          AND tr.is_driver = false
          AND (
            cc.is_driver = false
            OR (
              cc.is_driver = true
              AND cc.acquisition_id = $1::int
            )
          )
      `,
      values: [acquisitionId],
    };

    const dbResult = await this.connection.getClient().query(query);
    return [dbResult.rows];
  }
}
