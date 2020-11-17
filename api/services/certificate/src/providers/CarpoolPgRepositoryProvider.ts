import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { PointInterface } from '../shared/common/interfaces/PointInterface';
import {
  CarpoolInterface,
  CarpoolRepositoryProviderInterface,
  CarpoolRepositoryProviderInterfaceResolver,
  FindParamsInterface,
} from '../interfaces/CarpoolRepositoryProviderInterface';

@provider({
  identifier: CarpoolRepositoryProviderInterfaceResolver,
})
export class CarpoolPgRepositoryProvider implements CarpoolRepositoryProviderInterface {
  constructor(protected connection: PostgresConnection) {}

  /**
   * Find all carpools for an identity on a given period of time
   *
   * TODO find a more elegant way to use the join on carpool and policy schemas
   * TODO filter by operator and territory too
   * TODO replace any output by proper interface
   */
  async find(params: FindParamsInterface): Promise<CarpoolInterface[]> {
    const { identity, operator_id, tz, start_at, end_at, positions = [], radius = 1000 } = params;

    // TODO get tz
    const values: any[] = [
      identity.phone,
      identity.phone_trunc,
      operator_id,
      identity.operator_user_id,
      identity.travel_pass_name,
      identity.travel_pass_user_id,
      start_at,
      end_at,
    ];

    const where_positions = positions
      .reduce((prev: string[], pos: PointInterface): string[] => {
        prev.push(
          `ST_Distance(ST_MakePoint(\$${values.length + 1}, \$${values.length + 2}), cc.start_position) < \$${
            values.length + 3
          }`,
        );
        values.push(pos.lon, pos.lat, Math.abs(radius | 0));

        prev.push(
          `ST_Distance(ST_MakePoint(\$${values.length + 1}, \$${values.length + 2}), cc.end_position) < \$${
            values.length + 3
          }`,
        );
        values.push(pos.lon, pos.lat, Math.abs(radius | 0));

        return prev;
      }, [])
      .join(' OR ');

    // add Timezone
    values.push(tz || 'GMT');

    // fetch the number of kilometers per month
    const text = `
      WITH list AS (
        (
          SELECT _id FROM carpool.identities
          WHERE phone IS NOT NULL and phone = $1::varchar
        ) UNION (
          SELECT _id FROM carpool.identities
          WHERE phone_trunc IS NOT NULL AND phone_trunc = $2::varchar
          AND operator_user_id = $4::varchar
        ) UNION (
          SELECT _id FROM carpool.identities
          WHERE phone_trunc IS NOT NULL AND phone_trunc = $2::varchar
          AND travel_pass_name = $5::varchar AND travel_pass_user_id = $6::varchar
        )
      )
      SELECT
        to_char(cc.datetime AT TIME ZONE $${values.length},'MM') AS m,
        to_char(cc.datetime AT TIME ZONE $${values.length},'YYYY') AS y,
        count(*)::int as trips,
        sum(cc.distance::float)/1000 as km,
        sum(cc.cost::float)/100 as eur
      FROM list
      LEFT JOIN carpool.carpools cc ON list._id = cc.identity_id
      WHERE cc.operator_id = $3::int
      AND cc.datetime >= $7 AND cc.datetime <= $8
      ${where_positions.length ? `AND (${where_positions})` : ''}
      GROUP BY (m, y)
      ORDER BY y DESC, m DESC
    `;

    const result = await this.connection.getClient().query(text, values);

    return result.rows;
  }
}
