// tslint:disable: no-constant-condition
import axios from 'axios';
import { command, CommandInterface, CommandOptionType } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

@command()
export class SyncTerritoryInseeCommand implements CommandInterface {
  static readonly signature: string = 'sync:insee';
  static readonly description: string = 'sync INSEE data';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-u, --database-uri <uri>',
      description: 'Postgres connection string',
      default: process.env.APP_POSTGRES_URL,
    },
    {
      signature: '--insee <uint>',
      description: 'Insee Code',
      default: null,
    },
  ];

  static async getCityDataFromAPI(
    insee: string,
    postcodes = [],
  ): Promise<{
    name: string;
    surface: number;
    population: number;
    geo: any;
    postcodes: string[];
    code_departement: string;
  }> {
    const data = (
      await axios.get(
        `https://geo.api.gouv.fr/communes?code=${insee}` +
          '&fields=code,codesPostaux,nom,contour,surface,population,codeDepartement',
      )
    ).data;

    if (data && data.length > 0) {
      const surface = data[0].surface || 0;
      const population = data[0].population || 0;
      data[0].codesPostaux.forEach((cp) => postcodes.push(cp));
      const name = data[0].nom;
      const geo: any = data[0].contour;

      return {
        surface,
        population,
        name,
        geo,
        postcodes,
        code_departement: data[0].codeDepartement,
      };
    } else {
      return null;
    }
  }

  // tslint:disable-next-line: no-shadowed-variable
  public async call(options): Promise<void> {
    const pgConnection = new PostgresConnection({
      connectionString: options.databaseUri,
    });

    await pgConnection.up();

    const pgClient = pgConnection.getClient();

    const departements = (
      await pgClient.query(`
        SELECT
          t._id,
          tc.value AS code_dep,
          t.name
        FROM territory.territory_codes AS tc
        INNER JOIN territory.territories AS t
        ON t._id = tc.territory_id AND tc.type = 'codedep'
      `)
    ).rows;

    for (const departement of departements) {
      const depTownsApiData = (
        await axios.get(
          `https://geo.api.gouv.fr/communes?codeDepartement=${departement.code_dep}` +
            '&fields=nom,code,contour,surface,population',
        )
      ).data as any[];

      const idInseeId = {};
      const depMapInseeId = (
        await pgClient.query({
          text: `
            SELECT
              tc.territory_id,
              tc.value AS insee
            FROM territory.territory_relation AS tr
            INNER JOIN territory.territory_codes tc
            ON (tr.parent_territory_id = $1
            AND tr.child_territory_id = tc.territory_id AND tc.type='insee')
            INNER JOIN territory.territories t ON t._id = tc.territory_id
        `,
          values: [departement._id],
        })
      ).rows;

      depMapInseeId.forEach((idInsee) => (idInseeId[idInsee.insee] = idInsee.territory_id));

      for (const town of depTownsApiData) {
        const _id = idInseeId[town.code];

        if (_id === undefined) continue;

        const surface = town.surface || 0;
        const population = town.population || 0;
        const geo: any = town.contour;
        const name: any = town.nom;

        const values = [_id, population, Math.round(surface), geo, `${name} (${departement.code_dep})`];

        const query = {
          text: `
            UPDATE territory.territories
            SET
              population = $2,
              surface = $3,
              geo = ST_GeomFromGeoJSON($4::json),
              name = $5
            WHERE _id = $1`,
          values,
        };

        await pgClient.query(query);
      }
    }
  }
}
