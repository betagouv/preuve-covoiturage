import axios from 'axios';
import { promisify } from 'util';
import { command, CommandInterface, CommandOptionType } from '@ilos/common';
import { PostgresConnection, Cursor } from '@ilos/connection-postgres';

@command()
export class SyncGeoSurfacePopulationCommand implements CommandInterface {
  static readonly signature: string = 'geo:surfacepopulation';
  static readonly description: string = 'import all missing surface and population from geo.data.gouv.fr';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-u, --database-uri <uri>',
      description: 'Postgres connection string',
      default: process.env.APP_POSTGRES_URL,
    },
  ];

  public async call(options): Promise<string> {
    try {
      const selectQuery = `
        SELECT tt._id, tc.value insee
        FROM territory.territories tt
        LEFT JOIN territory.territory_codes tc
        ON tt._id=tc.territory_id
        WHERE tc.type='insee'
          AND tt.level = 'town'
          AND tt.geo IS NOT NULL
          AND (tt.surface IS NULL OR tt.population IS NULL)
      `;

      const pgConnection = new PostgresConnection({ connectionString: options.databaseUri });
      await pgConnection.up();
      const pgClient = pgConnection.getClient();
      const pgConnected = await pgClient.connect();
      const cursorCb = pgConnected.query(new Cursor(selectQuery));
      const cursor = promisify(cursorCb.read.bind(cursorCb));
      const ROW_COUNT = 10;
      let count = 0;

      do {
        const results = await cursor(ROW_COUNT);
        count = results.length;

        for (const line of results) {
          let data;
          try {
            const url = `https://geo.api.gouv.fr/communes?code=${line.insee}&fields=code,nom,population`;
            const response = await axios.get(url);

            data = response.data;

            if (!data.length) throw new Error(`${line.insee} not found`);

            await pgClient.query({
              text: `
                UPDATE territory.territories
                SET
                  surface = ST_Area(geo, true)::int,
                  population = $2
                WHERE _id = $1
              `,
              values: [line._id, data[0].population ?? null],
            });

            console.debug(`> UPDATE #${line._id}\t${line.insee}\t${data[0].population} habitants\t${data[0].nom}`);
          } catch (e) {
            console.error(`> ERROR #${line._id}\t${line.insee}`, { message: e.message, data });
          }
        }
      } while (count !== 0);

      return 'Finito';
    } catch (e) {
      console.error(e.message, e);
    }
  }
}
