import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { TerritoryRepositoryProviderInterface, TerritoryRepositoryProviderInterfaceResolver } from '../interfaces';

@provider({
  identifier: TerritoryRepositoryProviderInterfaceResolver,
})
export class TerritoryRepositoryProvider implements TerritoryRepositoryProviderInterface {
  protected readonly geoTable = 'territory.territories';
  protected readonly companyTable = 'company.companies';

  constructor(protected connection: PostgresConnection) {}

  async findByPoint({ lon, lat }: { lon: number; lat: number }): Promise<number[]> {
    try {
      const result = await this.connection.getClient().query({
        text: `
          WITH data AS (
            SELECT _id
            FROM ${this.geoTable}
            WHERE geo IS NOT NULL AND 
            ST_INTERSECTS(geo, ST_POINT($1::float, $2::float))
            ORDER BY ST_Area(geo, true) ASC
            LIMIT 1
          ) SELECT
            UNNEST(
              territory.get_ancestors(ARRAY[_id])
            ) as _id
            FROM data
        `,
        values: [lon, lat],
      });

      return result.rows.map((r) => r._id);
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      return null;
    }
  }

  async findSiretById(_id: number | number[]): Promise<{ _id: number; siret: string }[]> {
    const query = {
      text: `
        SELECT
          t._id, c.siret
        FROM ${this.geoTable} AS t
        LEFT JOIN ${this.companyTable} AS c
          ON c._id = t.company_id
        WHERE t._id = ${Array.isArray(_id) ? 'ANY($1)' : '$1'}
      `,
      values: [_id],
    };
    const result = await this.connection.getClient().query(query);
    return result.rows;
  }
}
