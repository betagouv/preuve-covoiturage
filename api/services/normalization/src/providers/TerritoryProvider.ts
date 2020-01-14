import { provider, ContextType } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import {
  TerritoryProviderInterface,
  TerritoryProviderInterfaceResolver,
} from '../interfaces/TerritoryProviderInterface';

const context: ContextType = {
  call: {
    user: {},
  },
  channel: {
    service: 'normalization',
    transport: 'queue',
  },
};

@provider({
  identifier: TerritoryProviderInterfaceResolver,
})
export class TerritoryProvider implements TerritoryProviderInterface {
  protected readonly pivotTable = 'territory.insee';
  protected readonly geoTable = 'common.insee';

  constructor(protected connection: PostgresConnection) {}

  async findByInsee(insee: string): Promise<number> {
    try {
      const result = await this.connection.getClient().query({
        text: `
          SELECT territory_id
          FROM ${this.pivotTable}
          WHERE _id = $1
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
          SELECT territory_id
          FROM ${this.pivotTable}
          NATURAL JOIN ${this.geoTable}
          WHERE ST_Intersects(ST_MakePoint($1, $2), geo)
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
