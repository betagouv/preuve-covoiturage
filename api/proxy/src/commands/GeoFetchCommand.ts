import axios from 'axios';
import { promisify } from 'util';
import { command, CommandInterface, CommandOptionType } from '@ilos/common';
import { PostgresConnection, Cursor } from '@ilos/connection-postgres';

@command()
export class GeoFetchCommand implements CommandInterface {
  static readonly signature: string = 'geo:fetch';
  static readonly description: string = 'import all missing shapes in common.insee table from geo.data.gouv.fr';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-u, --database-uri <uri>',
      description: 'Postgres connection string',
      default: process.env.APP_POSTGRES_URL,
    },
  ];

  public async call(options): Promise<string> {
    try {
      const pgConnection = new PostgresConnection({
        connectionString: options.databaseUri,
      });

      await pgConnection.up();
      const pgClient = pgConnection.getClient();
      const pgConnected = await pgClient.connect();
      const cursorCb = pgConnected.query(new Cursor(`SELECT _id FROM common.insee WHERE geo IS NULL`));
      const cursor = promisify(cursorCb.read.bind(cursorCb));
      const ROW_COUNT = 10;
      let count = 0;

      const totalStart = await pgClient.query('SELECT COUNT(*) FROM common.insee where geo IS NULL');

      do {
        const results = await cursor(ROW_COUNT);
        count = results.length;

        for (const line of results) {
          try {
            const response = await axios.get(
              `https://geo.api.gouv.fr/communes?code=${line._id}&fields=code,nom,codesPostaux,contour`,
            );

            const { data } = response;

            await pgClient.query({
              text: `
                UPDATE common.insee
                SET
                  geo = ST_GeomFromGeoJSON($2),
                  postcodes = $3,
                  town = $4
                WHERE _id = $1
              `,
              values: [line._id, data[0].contour, data[0].codesPostaux, data[0].nom],
            });

            console.log('> UPDATE', line._id, data[0].nom, data[0].contour && data[0].contour !== '');
          } catch (e) {
            console.log('> ERROR', line._id, e);
          }
        }
      } while (count !== 0);

      const totalEnd = await pgClient.query('SELECT COUNT(*) FROM common.insee where geo IS NULL');

      console.table({
        Start: parseInt(totalStart.rows[0].count, 10),
        End: parseInt(totalEnd.rows[0].count, 10),
        Found: parseInt(totalStart.rows[0].count, 10) - parseInt(totalEnd.rows[0].count, 10),
      });

      return 'Finito';
    } catch (e) {
      console.log(e);
    }
  }
}
