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
        `https://geo.api.gouv.fr/communes?code=${insee}&fields=code,codesPostaux,nom,contour,surface,population,codeDepartement`,
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
      await pgClient.query(
        `SELECT t._id,tc.value as code_dep,t.name from territory.territory_codes tc INNER JOIN territory.territories t ON t._id = tc.territory_id AND tc.type = 'codedep'`,
      )
    ).rows;

    for (const departement of departements) {
      const depTownsApiData = (
        await axios.get(
          `https://geo.api.gouv.fr/communes?codeDepartement=${departement.code_dep}&fields=nom, code,contour,surface,population`,
        )
      ).data as any[];

      const idInseeId = {};
      const depMapInseeId = (
        await pgClient.query(`SELECT tc.territory_id, tc.value as insee from territory.territory_relation tr 

      INNER JOIN territory.territory_codes tc ON (tr.parent_territory_id = ${departement._id} AND tr.child_territory_id = tc.territory_id AND tc.type='insee')
      INNER JOIN territory.territories t ON t._id = tc.territory_id
      
      `)
      ).rows;

      depMapInseeId.forEach((idInsee) => (idInseeId[idInsee.insee] = idInsee.territory_id));
      // console.log('idInseeId : ', idInseeId);
      for (const town of depTownsApiData) {
        const _id = idInseeId[town.code];

        // console.log('town : ', town);
        // console.log('_id : ', _id);

        if (_id === undefined) continue;

        const surface = town.surface || 0;
        const population = town.population || 0;
        const geo: any = town.contour;
        const name: any = town.nom;

        const values = [_id, population, Math.round(surface), geo, `${name} (${departement.code_dep})`];

        const query = {
          text: `UPDATE territory.territories SET population=$2, surface=$3, geo=ST_GeomFromGeoJSON($4::json), name=$5
          WHERE _id = $1`,
          values,
        };

        // console.log('query ', query);
        // console.log(query);

        await pgClient.query(query);

        // break;
      }

      // break;
    }
  }

  /*
  // tslint:disable-next-line: no-shadowed-variable
  public async call(options): Promise<string> {
    try {
      const pgConnection = new PostgresConnection({
        connectionString: options.databaseUri,
      });

      await pgConnection.up();

      const pgClient = pgConnection.getClient();

      const results = await pgClient.query(`
              
      SELECT 

      t.name,
      t._id,
      tc.value as insee,

      tp._id as department_id, 
      tpc.value as code_departement 

      from territory.territories t

      INNER JOIN territory.territory_codes tc ON tc.territory_id = t._id AND tc.type='insee'
      LEFT JOIN territory.territory_relation tr ON tr.child_territory_id = t._id
      LEFT JOIN territory.territories tp ON tr.parent_territory_id = tp._id AND tp.level='district'
      LEFT JOIN territory.territory_codes tpc ON tpc.territory_id = tp._id AND tpc.type='codedep'

      WHERE (t.level='town' OR t.level='towngroup') 
            ;
      `);

      if (results.rowCount === 0) {
        return 'All geo data found';
      }

      const listCities: { _id: string; insee: string; departement_id: number; code_departement: string }[] = [
        ...results.rows,
      ];

      const departmentsCodeIdMapRows = (
        await pgClient.query(`SELECT t._id, tc.value as code_dep from territory.territories t INNER JOIN territory.territory_codes tc ON t.level = 'district' AND t._id = tc.territory_id AND tc.type = 'codedep' 
      `)
      ).rows;

      const departmentsCodeIdMap: { [key: string]: number } = {};

      for (const departmentsCodeIdMapRow of departmentsCodeIdMapRows)
        departmentsCodeIdMap[departmentsCodeIdMapRow.code_dep.toString()] = parseInt(departmentsCodeIdMapRow._id);

      // sync existing cities
      while (listCities.length > 0) {
        const { _id, insee } = listCities.pop();
        const postcodes = [];

        // const code = insees[0];
        if (insee) {
          const data = await SyncTerritoryInseeCommand.getCityDataFromAPI(insee, postcodes);
          // console.log(data);

          if (data) {
            const { surface, population, name, geo, code_departement } = data;
            try {
              await pgClient.query('BEGIN');

              // geoString = SyncTerritoryInseeCommand.geoToPgGeo(geo);

              const values = [
                _id,
                population,
                Math.round(surface),
                geo,
                `${name}${code_departement ? ` (${code_departement})` : ''}`,
              ];
              // if (name) values.push(name);

              const query = {
                text: `UPDATE territory.territories SET population=$2, surface=$3, geo=ST_GeomFromGeoJSON($4::json) ${
                  name ? ',name=$5' : ''
                } WHERE _id = $1`,
                values,
              };

              // console.log(query);

              await pgClient.query(query);

              // reset postcode
              if (postcodes !== undefined && postcodes.length > 0) {
                await pgClient.query({
                  text: `DELETE FROM territory.territory_codes WHERE type='postcode' and territory_id=$1`,
                  values: [_id],
                });

                const postCodeInserts = postcodes.map((postcode) => `(${_id},'postcode',${postcode})`);

                await pgClient.query(
                  `INSERT INTO territory.territory_codes (territory_id, type, value) VALUES ${postCodeInserts.join(
                    ',',
                  )}`,
                );
              }

              // reset diGEOMETRYCOLLECTIONstrict relation
              const delQ = {
                text: `
                DELETE FROM territory.territory_relation tr 
                USING territory.territories t WHERE t._id = tr.parent_territory_id AND t.level = 'district' AND tr.child_territory_id = $1;`,
                values: [_id],
              };

              await pgClient.query(delQ);
              if (code_departement !== undefined) {
                await pgClient.query({
                  text: `
                INSERT INTO territory.territory_relation(parent_territory_id, child_territory_id) VALUES($1,$2)`,

                  values: [departmentsCodeIdMap[code_departement], _id],
                });
              }

              await pgClient.query('COMMIT');
            } catch (e) {
              await pgClient.query('ROLLBACK');
              console.error('failed to update ', insee, data, code_departement, name, e);
              // throw e;
            }
          }
        }
      }

      // return;

      const existingCityInsees = results.rows.map((city) => city.insee);
      const districts = (
        await pgClient.query(`SELECT 
      t._id,tc.value as insee
      
       from territory.territories t 
      INNER JOIN territory.territory_codes tc ON tc.territory_id = t._id AND tc.type='codedep'
      WHERE t.level = 'district';`)
      ).rows;

      for (const district of districts) {
        const data = (await axios.get(`https://geo.api.gouv.fr/communes?codeDepartement=${district.insee}&fields=code`))
          .data;

        for (const depCity of data) {
          if (existingCityInsees.indexOf(depCity.code) === -1) {
            const depCityData = await SyncTerritoryInseeCommand.getCityDataFromAPI(depCity.code);

            try {
              pgClient.query('BEGIN');
              const { surface, population, name, geo, code_departement } = depCityData;

              // const geoString = SyncTerritoryInseeCommand.geoToPgGeo(geo);

              const values = [Math.round(surface), population, geo, `${name} (${code_departement})`];

              const query = {
                text: `INSERT INTO territory.territories(population, surface, geo,name,level) VALUES($1,$2, ST_GeomFromGeoJSON($3::json),$4,'town')`,
                values,
              };

              await pgClient.query(query);

              // set insee;
              await pgClient.query({
                text: `INSERT INTO territory.territory_codes(territory_id,type,value) VALUES(currval('territory.territories__id_seq1'),'insee',$1)`,
                values: [depCity.code],
              });

              // set postcodes
              for (const postcode of depCityData.postcodes) {
                await pgClient.query({
                  text: `INSERT INTO territory.territory_codes(territory_id,type,value) VALUES(currval('territory.territories__id_seq1'),'postcode',$1)`,
                  values: [postcode],
                });
              }
              // link to department
              await pgClient.query({
                text: `INSERT INTO territory.territory_relation(parent_territory_id,child_territory_id) VALUES($1,currval('territory.territories__id_seq1'))`,
                values: [district._id],
              });

              pgClient.query('COMMIT');
            } catch (e) {
              pgClient.query('ROLLBACK');
              console.error('failed insert ', depCityData.name, e);
              throw e;
            }
          }
        }
      }

      return 'All geo data found';
    } catch (e) {
      console.log(e);
    }
  }
  */
}
