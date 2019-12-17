import { command, CommandInterface, CommandOptionType } from '@ilos/common';
import { MongoConnection } from '@ilos/connection-mongo';
import { PostgresConnection } from '@ilos/connection-postgres';

@command()
export class MigrateDataCommand implements CommandInterface {
  static readonly signature: string = 'migrate-data:user';
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
      default: 'users',
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
        console.log(doc._id, doc.group, doc.role, doc.email);
        await writeClient.query({
          text: `
        INSERT INTO auth.users
        (
          operator_id,
          territory_id,
          email,
          firstname,
          lastname,
          phone,
          password,
          status,
          role,
          created_at,
          updated_at,
          deleted_at
        )
        VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12 )
        ON CONFLICT DO NOTHING
        `,
          values: [
            doc.operator ? doc.operator.toString() : null,
            doc.territory ? doc.territory.toString() : null,
            doc.email,
            doc.firstname || '',
            doc.lastname || '',
            doc.phone,
            doc.password,
            doc.status || 'pending',
            `${this.singularize(doc.group)}.${doc.role}`,
            doc.created_at || new Date(),
            doc.updated_at || new Date(),
            doc.deleted_at || null,
          ],
        });
      } catch (e) {
        console.log(e);
      }
    }

    return 'Done!';
  }

  private singularize(group: 'operators' | 'territories'): string {
    switch (group) {
      case 'operators':
        return 'operator';
      case 'territories':
        return 'territory';
      default:
        return group;
    }
  }
}
