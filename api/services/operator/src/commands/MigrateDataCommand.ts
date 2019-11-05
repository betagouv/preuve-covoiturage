import { get } from 'lodash';
import { command, CommandInterface, CommandOptionType } from '@ilos/common';
import { MongoConnection } from '@ilos/connection-mongo';
import { PostgresConnection, Cursor } from '@ilos/connection-postgres';

@command()
export class MigrateDataCommand implements CommandInterface {
  static readonly signature: string = 'migrate-data:operator';
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
      default: 'operators',
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

    const cursor = readClient.find({});

    // tslint:disable-next-line: no-constant-condition
    while (true) {
      if (!(await cursor.hasNext())) break;
      try {
        const doc = await cursor.next();
        console.log(doc._id, doc.nom_commercial);
        await writeClient.query({
          text: `
        INSERT INTO operator.operators
        ( name, legal_name, siret, company, address, bank, contacts, cgu_accepted_at, cgu_accepted_by, created_at, updated_at )
        VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11 )
        `,
          values: [
            doc.nom_commercial,
            doc.raison_sociale || doc.nom_commercial,
            get(doc, 'company.siret', null),
            doc.company || {},
            doc.address || {},
            doc.bank || {},
            doc.contacts || {},
            get(doc, 'cgu.accepted', null) ? get(doc, 'updated_at', null) : null,
            null,
            doc.created_at || new Date(),
            doc.updated_at || new Date(),
          ],
        });
      } catch (e) {
        console.log(e);
      }
    }

    return 'Done!';
  }
}
