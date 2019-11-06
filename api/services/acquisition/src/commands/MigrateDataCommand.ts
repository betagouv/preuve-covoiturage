import { command, CommandInterface, CommandOptionType } from '@ilos/common';
import { promisify } from 'util';
import { PostgresConnection } from '@ilos/connection-postgres';
import { MongoConnection } from '@ilos/connection-mongo';

@command()
export class MigrateDataCommand implements CommandInterface {
  static readonly signature: string = 'migrate-data:acquisition';
  static readonly description: string = 'Migrate data from old table to new table';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-p, --postgres-uri <uri>',
      description: 'Connection string to postgres',
      default: process.env.APP_POSTGRES_URL,
    },
    {
      signature: '-m, --mongo-uri <uri>',
      description: 'Connection string to mongo',
      default: process.env.APP_MONGO_URL,
    },
    {
      signature: '-d, --database <db>',
      description: 'Database to user',
      default: process.env.APP_MONGO_DB,
    },
  ];

  // tslint:disable-next-line: no-shadowed-variable
  public async call(options): Promise<string> {
    const connection = new MongoConnection({
      connectionString: options.mongoUri,
    });

    const writeconnection = new PostgresConnection({
      connectionString: options.postgresUri,
    });

    await connection.up();
    await writeconnection.up();

    const read = connection.getClient();
    const write = writeconnection.getClient();

    const cursor = read
      .db(options.database)
      .collection('safejourneys')
      .find(
        {},
        {
          projection: {
            __v: 0,
            duplicatedAt: 0,
            updatedAt: 0,
          },
        },
      );
    // tslint:disable-next-line: no-constant-condition
    while (true) {
      if (!(await cursor.hasNext())) {
        break;
      }

      try {
        const { _id, createdAt, operator, journey_id, ...payload } = await cursor.next();
        console.log(_id);
        await write.query({
          text: `INSERT INTO acquisition.acquisitions
            (application_id, operator_id, journey_id, payload, created_at)
            VALUES ($1, $2, $3, $4, $5)`,
          values: [
            '', // application_id,
            operator._id.toString(),
            journey_id,
            payload,
            createdAt,
          ],
        });
        console.log('ok!');
      } catch (e) {
        console.error('error');
        console.log(e);
      }
    }

    return 'Done!';
  }
}
