// tslint:disable: no-constant-condition
import axios from 'axios';
import { command, CommandInterface, CommandOptionType } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

@command()
export class SyncRegionDepCommand implements CommandInterface {
  static readonly signature: string = 'sync:region_dep';
  static readonly description: string = 'sync Region and department data';
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

      await pgClient.query(`ALTER TABLE territory.territory_relation DISABLE TRIGGER ALL;`);

      const results = await pgClient.query(`
        SELECT t._id, t.name, tc.value as insee FROM territory.territories t JOIN territory.territory_codes tc ON t._id = tc.territory_id  WHERE t.level='region';
     `);

      const regions = results.rows;

      for (const region of regions) {
        const apiDepartmentsData = (await axios.get(`https://geo.api.gouv.fr/departements?codeRegion=${region.insee}`))
          .data;

        const codeDepartements = apiDepartmentsData.map((dep) => dep.code);

        await pgClient.query({
          text: `
          DELETE FROM territory.territory_relation tr WHERE tr.parent_territory_id = $1; 
        `,
          values: [region._id],
        });

        const departements = (
          await pgClient.query({
            text: `
            SELECT t._id, tc.value as codedep FROM territory.territory_codes tc INNER JOIN territory.territories t ON tc.territory_id = t._id AND tc.type='codedep' WHERE t.level = 'district' AND tc.value = ANY($1)
          `,
            values: [codeDepartements],
          })
        ).rows;

        try {
          for (const department of apiDepartmentsData) {
            await pgClient.query(`BEGIN`);

            const dbDep = departements.find((dep) => dep.codedep === department.code);

            // continue;
            if (dbDep) {
              const updateQuery = {
                text: 'UPDATE territory.territories SET name=$1 WHERE _id=$2',
                values: [`${department.nom} (${department.code})`, dbDep._id],
              };

              await pgClient.query(updateQuery);

              await pgClient.query({
                text: 'DELETE FROM territory.territory_relation WHERE child_territory_id=$1',
                values: [dbDep._id],
              });

              await pgClient.query({
                text: 'INSERT INTO territory.territory_relation (parent_territory_id,child_territory_id) VALUES($1,$2)',
                values: [region._id, dbDep._id],
              });
            } else {
              const createQuery = {
                text: `INSERT INTO territory.territories(name,level) VALUES($1,'district')`,
                values: [`${department.nom} (${department.code})`],
              };

              await pgClient.query(createQuery);

              await pgClient.query({
                text: `INSERT INTO territory.territory_relation (parent_territory_id,child_territory_id) VALUES($1,currval('territory.territories__id_seq1'))`,
                values: [region._id],
              });

              await pgClient.query({
                text: `INSERT INTO territory.territory_codes (territory_id,type,value) VALUES(currval('territory.territories__id_seq1'),'codedep',$1)`,
                values: [department.code],
              });
            }

            await pgClient.query(`COMMIT`);
          }
        } catch (e) {
          await pgClient.query(`ROLLBACK`);
          throw e;
        }
      }

      /*

      WITH territory_name_init_cap AS (
        select _id, INITCAP(name) as name FROM territory.territories where level='epic'
        )
        UPDATE territory.territories SET name = tc.name FROM territory_name_init_cap tc WHERE territorie	s._id = tc._id;*/

      await pgClient.query(`
      
     

      
      WITH tr as (
        select  
            dep_tc.territory_id as parent_territory_id,
            t._id as child_territory_id
            FROM territory.territory_codes tc 
        INNER JOIN territory.territories t ON t._id = tc.territory_id AND tc.type = 'postcode'
        INNER JOIN territory.territory_codes dep_tc ON dep_tc.value = substring(tc.value,1,2)
        
        LEFT JOIN territory.territory_relation tr ON tr.parent_territory_id = dep_tc.territory_id AND tr.child_territory_id = t._id
        
        where tr._id IS NULL
        )
        

        INSERT INTO territory.territory_relation(parent_territory_id,child_territory_id) SELECT tr.parent_territory_id,tr.child_territory_id from tr ON CONFLICT DO NOTHING;

        `);

      await pgClient.query(`ALTER TABLE territory.territory_relation DISABLE TRIGGER ALL;`);

      return 'OK';
    } catch (e) {
      console.log(e);
    }
  }
}
