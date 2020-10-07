import { provider } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import {
  TerritoryProviderInterface,
  TerritoryProviderInterfaceResolver,
} from '../interfaces/TerritoryProviderInterface';

@provider({
  identifier: TerritoryProviderInterfaceResolver,
})
export class TerritoryProvider implements TerritoryProviderInterface {
  protected readonly codeTable = 'territory.territory_codes';
  protected readonly geoTable = 'territory.territories';

  constructor(protected connection: PostgresConnection) {}

  async findByInsee(insee: string): Promise<number> {
    try {
      const result = await this.connection.getClient().query({
        text: `
          SELECT territory_id
          FROM ${this.codeTable}
          WHERE type = 'insee' AND value = $1::varchar
          LIMIT 1
        `,
        values: [insee],
      });

      return result.rowCount ? result.rows[0].territory_id : null;
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      return null;
    }
  }

  async findByPoint({ lon, lat }: { lon: number; lat: number }): Promise<number> {
    try {
      const result = await this.connection.getClient().query({
        text: `
          SELECT _id
          FROM ${this.geoTable}
          WHERE geo IS NOT NULL AND 
          ST_INTERSECTS(geo, ST_POINT($1::float, $2::float))
          ORDER BY ST_Area(geo, true) ASC
          LIMIT 1
        `,
        values: [lon, lat],
      });

      return result.rowCount ? result.rows[0].territory_id : null;
    } catch (e) {
      console.log(e.message);
      console.log(e.stack);
      return null;
    }
  }
}
