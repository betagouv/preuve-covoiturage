// tslint:disable: no-constant-condition
import axios from 'axios';
import { command, CommandInterface, CommandOptionType } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

@command()
export class InseeSeedCommand implements CommandInterface {
  static readonly signature: string = 'insee:seed';
  static readonly description: string = 'Seed INSEE data';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-u, --database-uri <uri>',
      description: 'Postgres connection string',
      default: process.env.APP_POSTGRES_URL,
    },
  ];

  // tslint:disable-next-line: no-shadowed-variable
  public async call(options): Promise<string> {
    try {
      const pgConnection = new PostgresConnection({
        connectionString: options.databaseUri,
      });

      await pgConnection.up();

      const pgClient = pgConnection.getClient();

      const results = await pgClient.query(`
        SELECT territory.insee._id
        FROM territory.insee
        LEFT JOIN common.insee
        ON territory.insee._id = common.insee._id
        WHERE geo IS NULL
      `);

      if (results.rowCount === 0) {
        return 'All geo data found';
      }

      const list: { _id: string }[] = [...results.rows];
      while (list.length > 0) {
        const { _id: code } = list.pop();
        try {
          const response = await axios.get(
            `https://geo.api.gouv.fr/communes?code=${code}&fields=code,nom,codesPostaux,contour`,
          );

          const { data } = response;

          await pgClient.query({
            text: `INSERT INTO common.insee ( _id, geo, postcodes, town, country )
                  VALUES ( $1, ST_GeomFromGeoJSON($2), $3, $4, $5 )`,
            values: [
              code,
              data[0].contour,
              data[0].codesPostaux,
              data[0].nom,
              code.substr(0, 2) !== '99' ? 'France' : null,
            ],
          });

          console.log('> INSERT', code, data[0].nom);
        } catch (e) {
          console.log('> ERROR', code, e);
        }
      }

      return 'All geo data found';
    } catch (e) {
      console.log(e);
    }
  }
}
