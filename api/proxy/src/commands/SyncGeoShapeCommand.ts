import axios from 'axios';
import { promisify } from 'util';
import { command, CommandInterface, CommandOptionType } from '@ilos/common';
import { PostgresConnection, Cursor } from '@ilos/connection-postgres';

@command()
export class SyncGeoShapeCommand implements CommandInterface {
  static readonly signature: string = 'geo:shape';
  static readonly description: string = 'get missing shapes in territory.territories from geo.data.gouv.fr';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-u, --database-uri <uri>',
      description: 'Postgres connection string',
      default: process.env.APP_POSTGRES_URL,
    },
  ];

  public async call(options): Promise<string> {
    try {
      const query = `
        SELECT tt._id, tc.value insee
        FROM territory.territories tt
        LEFT JOIN territory.territory_codes tc
        ON tt._id = tc.territory_id
        WHERE tt.level = 'town'
        AND tc.type = 'insee'
        AND tt.geo IS NULL
      `;

      const pgConnection = new PostgresConnection({ connectionString: options.databaseUri });

      await pgConnection.up();
      const pgClient = pgConnection.getClient();
      const pgConnected = await pgClient.connect();
      const cursorCb = pgConnected.query(new Cursor(query));
      const cursor = promisify(cursorCb.read.bind(cursorCb));
      const ROW_COUNT = 10;
      let count = 0;

      do {
        const results = await cursor(ROW_COUNT);
        count = results.length;

        for (const line of results) {
          try {
            const response = await axios.get(`https://geo.api.gouv.fr/communes?code=${line.insee}&fields=nom,contour`);

            const { data } = response;

            if (!data.length) throw new Error(`${line._id}/${line.insee} not found`);
            if (!data[0].contour) throw new Error(`${line._id}/${line.insee} no shape available`);

            await pgClient.query({
              text: `
                UPDATE territory.territories
                SET geo = ST_GeomFromGeoJSON($2)
                WHERE _id = $1
              `,
              values: [line._id, data[0].contour],
            });

            console.debug(`> UPDATE ${line._id}\t${line.insee}\t${data[0].nom}`);
          } catch (e) {
            console.error(`> ERROR ${e.message}`);
          }
        }
      } while (count !== 0);

      return 'Finito';
    } catch (e) {
      console.error(e.message, e);
    }
  }
}
