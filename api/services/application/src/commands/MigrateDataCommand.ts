import { command, CommandInterface, CommandOptionType } from '@ilos/common';
import { MongoConnection } from '@ilos/connection-mongo';
import { PostgresConnection } from '@ilos/connection-postgres';

@command()
export class MigrateDataCommand implements CommandInterface {
  static readonly signature: string = 'migrate-data:application';
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
      default: 'applications',
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

    const cursor = readClient.find({ deleted_at: null });

    // tslint:disable-next-line: no-constant-condition
    while (true) {
      if (!(await cursor.hasNext())) break;
      try {
        const doc = await cursor.next();
        console.log(doc._id);
        await writeClient.query({
          text: `
        INSERT INTO application.applications
        ( uuid, name, owner_id, owner_service, permissions, created_at )
        VALUES ( $1, $2, $3, $4, $5, $6 )
        `,
          values: [
            doc._id.toString(),
            doc.name,
            doc.operator_id.toString(),
            'operator',
            ['journey.create'],
            doc.created_at,
          ],
        });
      } catch (e) {
        console.log(e);
      }
    }

    return 'Done!';
  }
}
