import axios from 'axios';
import { get } from 'lodash';
import { command, CommandInterface, CommandOptionType } from '@ilos/common';
import { MongoConnection } from '@ilos/connection-mongo';
import { PostgresConnection } from '@ilos/connection-postgres';

@command()
export class MigrateDataCommand implements CommandInterface {
  static readonly signature: string = 'migrate-data:territory';
  static readonly description: string = 'Migrate data from old table to new table';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-u, --database-uri <uri>',
      description: 'Postgres connection string',
      default: process.env.APP_POSTGRES_URL,
    },
    {
      signature: '-m, --mongo-uri <uri>',
      description: 'MongoDB Connection string',
      default: process.env.APP_MONGO_URL,
    },
    {
      signature: '-d, --db <uri>',
      description: 'MongoDB database',
      default: process.env.APP_MONGO_DB,
    },
    {
      signature: '-c, --collection <uri>',
      description: 'MongoDB collection',
      default: 'territories',
    },
  ];

  // tslint:disable-next-line: no-shadowed-variable
  public async call(options): Promise<string> {
    const mongo = new MongoConnection({
      connectionString: options.mongoUri,
    });

    const postgres = new PostgresConnection({
      connectionString: options.databaseUri,
    });

    await mongo.up();
    await postgres.up();

    const readClient = mongo
      .getClient()
      .db(options.db)
      .collection(options.collection);
    const writeClient = postgres.getClient();

    // fetch existing
    const existing = await writeClient.query('SELECT siret FROM territory.territories');

    const cursor = readClient.find({
      deleted_at: null,
      'company.siret': { $nin: existing.rows.map((i) => i.siret) },
    });

    // tslint:disable-next-line: no-constant-condition
    while (true) {
      if (!(await cursor.hasNext())) break;
      try {
        const doc = await cursor.next();

        const siren = get(doc, 'company.siren', null);
        let siret = `${siren}00000`;
        if (!siren) {
          console.log(`> Failed to get SIREN for ${doc._id.toString()}`);
        } else {
          try {
            // get the full SIRET from API entreprise
            console.log(`\n>>> Search for company (${siren}) "${doc.name}"`);
            const response = await axios.get(
              `https://entreprise.data.gouv.fr/api/sirene/v3/etablissements/?siren=${siren}`,
            );

            const found = response.data.etablissements.filter((e) => /^49\./.test(e.activite_principale));

            if (found.length) {
              siret = found[0].siret;
              console.log(`>>> Found SIRET (${siret}) for "${doc.name}"`);
            } else {
              siret = response.data.etablissements[0].unite_legale.etablissement_siege.siret;
              console.log(`>>> Found default SIRET (${siret}) for "${doc.name}"`);
            }
          } catch (e) {
            console.log(`>>> Failed to get SIRET:`, e.message);
          }
        }

        // create the territory
        const insertResult = await writeClient.query({
          text: `
          INSERT INTO territory.territories
          (
            siret,
            name,
            shortname,
            company,
            address,
            contacts,
            cgu_accepted_at,
            created_at,
            updated_at
          )
          VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9 )
          RETURNING _id
        `,
          values: [
            siret,
            doc.name,
            doc.shortname || '',
            doc.company || {},
            doc.address || {},
            doc.contacts || {},
            doc.cgu.accepted ? doc.updated_at || new Date() : null,
            doc.created_at || new Date(),
            doc.updated_at || new Date(),
          ],
        });

        const { _id } = insertResult.rows[0];
        console.log(`> Inserted "${doc.name}" with ID (${_id})`);

        // create the insee references
        const inserts = [];
        doc.insee.forEach((code) => {
          inserts.push(
            writeClient
              .query({
                text: `
                  INSERT INTO territory.insee
                  ( _id, territory_id )
                  VALUES ( $1, $2 )
                `,
                values: [code, _id],
              })
              .catch((e) => {
                console.log(`>> ERROR Duplicate INSEE (${code})`);
              }),
          );
        });

        await Promise.all(inserts);
        console.log(`> Inserted ${doc.insee.length} INSEE codes`);
      } catch (e) {
        console.log(e.message);
      }
    }

    return 'Done!';
  }
}
