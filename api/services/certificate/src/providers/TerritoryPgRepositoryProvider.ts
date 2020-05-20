import { provider, NotFoundException } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import {
  TerritoryPgRepositoryInterface,
  TerritoryPgRepositoryInterfaceResolver,
} from '../interfaces/TerritoryPgRepositoryInterface';

@provider({
  identifier: TerritoryPgRepositoryInterfaceResolver,
})
export class TerritoryPgRepository implements TerritoryPgRepositoryInterface {
  constructor(private pg: PostgresConnection) {}

  async quickFind(params: { _id: number }): Promise<{ uuid: string; name: string }> {
    const result = await this.pg.getClient().query({
      text: `
        SELECT uuid, name
        FROM territory.territories
        WHERE _id = $1
        LIMIT 1
      `,
      values: [params._id],
    });

    if (!result.rowCount) throw new NotFoundException(`Territory (${params._id}) not found`);

    return result.rows[0];
  }

  async findIdentityTerritories(params: { identity_id: number }): Promise<{ _id: number; name: string }[]> {
    const result = await this.pg.getClient().query({
      text: `
        SELECT DISTINCT ti.territory_id, name
        FROM territory.insee as ti
        JOIN territory.territories AS tt ON ti.territory_id = tt._id
        WHERE ti._id IN (
          SELECT unnest(array_agg(start_insee) || array_agg(end_insee)) AS insee
          FROM carpool.carpools
          WHERE identity_id = $1
        )
      `,
      values: [params.identity_id],
    });

    // return [] if nothing found
    return result.rows;
  }
}
