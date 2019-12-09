// tslint:disable: no-constant-condition
import { command, CommandInterface, CommandOptionType } from '@ilos/common';
import { PostgresConnection, PoolClient } from '@ilos/connection-postgres';
import { MongoConnection } from '@ilos/connection-mongo';

@command()
export class MapIdCommand implements CommandInterface {
  static readonly signature: string = 'mapid';
  static readonly description: string = 'Fix ID based references between tables in Postgres';
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
      signature: '--replace',
      description: 'Replace IDs in postgres',
      default: false,
    },
  ];

  private db; // Mongo Database
  private pg; // PG Client

  // tslint:disable-next-line: no-shadowed-variable
  public async call(options): Promise<string> {
    try {
      const mongo = new MongoConnection({
        connectionString: options.mongoUri,
      });

      const postgres = new PostgresConnection({
        connectionString: options.databaseUri,
      });

      await mongo.up();
      await postgres.up();

      this.db = mongo.getClient().db(options.db);
      this.pg = postgres.getClient();

      if (!options.replace) {
        const pg = await this.pg.connect();
        await pg.query('BEGIN');
        await pg.query(`
          CREATE TABLE IF NOT EXISTS public.mapids
          (
            _id serial primary key,
            collection varchar(64) NOT NULL,
            key varchar(24) NOT NULL,
            object_id varchar(24) NOT NULL,
            pg_id integer NOT NULL
          )
        `);
        await pg.query(
          `CREATE UNIQUE INDEX IF NOT EXISTS mapids_all_idx ON public.mapids (collection, object_id, pg_id)`,
        );
        await pg.query('COMMIT');
        pg.release();
      }

      await this.fixApplications(options.replace);
      await this.fixOperators(options.replace);
      await this.fixTerritories(options.replace);

      return options.replace ? '\n~~~ All IDs patched! ~~~' : '\n Mapping table created in public.mapids';
    } catch (e) {
      console.log(e);
    }
  }

  private async fixApplications(replace: boolean): Promise<void> {
    console.log('\n[fix applications]');
    const cursor = this.db.collection('applications').find({});

    while (true) {
      if (!(await cursor.hasNext())) break;

      // get the new ID
      const old = await cursor.next();
      const client: PoolClient = await this.pg.connect();
      await client.query('BEGIN');

      const results = await client.query({
        text: 'SELECT * FROM application.applications WHERE name=$1 AND created_at=$2',
        values: [old.name, old.created_at],
      });

      if (results.rowCount === 0) continue;
      const { _id } = results.rows[0];

      // store in mapids table
      await client.query({
        text: `
          INSERT INTO public.mapids (collection, key, object_id, pg_id)
          VALUES ( $1, $2, $3, $4 )
          ON CONFLICT DO NOTHING
        `,
        values: ['applications', 'application_id', old._id.toString(), _id],
      });

      // replace
      if (replace) {
        console.log('acquisitions.application_id:\t', old._id.toString(), '->', _id);
        await client.query({
          text: 'UPDATE acquisition.acquisitions SET application_id=$1 WHERE application_id=$2',
          values: [_id, old._id.toString()],
        });
      }

      await client.query('COMMIT');
      client.release();
    }
  }

  private async fixOperators(replace: boolean): Promise<void> {
    console.log('\n[fix operators]');
    const cursor = this.db.collection('operators').find({});

    while (true) {
      if (!(await cursor.hasNext())) break;

      // get the new ID
      const old = await cursor.next();
      const client: PoolClient = await this.pg.connect();
      await client.query('BEGIN');

      const results = await client.query({
        text: 'SELECT * FROM operator.operators WHERE name=$1 AND siret=$2',
        values: [old.nom_commercial, old.company.siret],
      });

      if (results.rowCount === 0) continue;
      const { _id } = results.rows[0];

      // store in mapids table
      await client.query({
        text: `
          INSERT INTO public.mapids (collection, key, object_id, pg_id)
          VALUES ( $1, $2, $3, $4 )
          ON CONFLICT DO NOTHING
        `,
        values: ['operators', 'operator_id', old._id.toString(), _id],
      });

      // replace
      if (replace) {
        console.log('acquisitions.operator_id:\t', old._id.toString(), '->', _id);
        await client.query({
          text: 'UPDATE acquisition.acquisitions SET operator_id=$1 WHERE operator_id=$2',
          values: [_id, old._id.toString()],
        });

        console.log('applications.owner_id:\t\t', old._id.toString(), '->', _id);
        await client.query({
          text: 'UPDATE application.applications SET owner_id=$1 WHERE owner_id=$2',
          values: [_id, old._id.toString()],
        });

        console.log('users.operator_id:\t\t', old._id.toString(), '->', _id);
        await client.query({
          text: 'UPDATE auth.users SET operator_id=$1 WHERE operator_id=$2',
          values: [_id, old._id.toString()],
        });

        console.log('carpools.operator_id:\t\t', old._id.toString(), '->', _id);
        await client.query({
          text: 'UPDATE carpool.carpools SET operator_id=$1 WHERE operator_id=$2',
          values: [_id, old._id.toString()],
        });
      }

      await client.query('COMMIT');
      client.release();
    }
  }

  private async fixTerritories(replace: boolean): Promise<void> {
    console.log('\n[fix territories]');
    const cursor = this.db.collection('territories').find({});

    while (true) {
      if (!(await cursor.hasNext())) break;

      // get the new ID
      const old = await cursor.next();
      const client: PoolClient = await this.pg.connect();
      await client.query('BEGIN');

      const results = await client.query({
        text: 'SELECT * FROM territory.territories WHERE name=$1',
        values: [old.name],
      });

      if (results.rowCount === 0) continue;
      const { _id } = results.rows[0];

      // store in mapids table
      await client.query({
        text: `
          INSERT INTO public.mapids (collection, key, object_id, pg_id)
          VALUES ( $1, $2, $3, $4 )
          ON CONFLICT DO NOTHING
        `,
        values: ['territories', 'territory_id', old._id.toString(), _id],
      });

      // replace
      if (replace) {
        console.log('users.territory_id:\t', old._id.toString(), '->', _id);
        await client.query({
          text: 'UPDATE auth.users SET territory_id=$1 WHERE territory_id=$2',
          values: [_id, old._id.toString()],
        });

        console.log('policies.territory_id:\t', old._id.toString(), '->', _id);
        await client.query({
          text: 'UPDATE policy.policies SET territory_id=$1 WHERE territory_id=$2',
          values: [_id, old._id.toString()],
        });
      }

      await client.query('COMMIT');
      client.release();
    }
  }
}
