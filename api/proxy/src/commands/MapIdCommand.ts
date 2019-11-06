// tslint:disable: no-constant-condition
import { command, CommandInterface, CommandOptionType } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
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

      await this.fixAcquisition();
      await this.fixApplications();
      await this.fixOperators();
      await this.fixTerritories();

      return '\n~~~ All IDs patched! ~~~';
    } catch (e) {
      console.log(e);
    }
  }

  private async fixAcquisition(): Promise<void> {
    console.log('\n[fix acquisition]');
    const cursor = this.db.collection('safejourneys').find({});

    while (true) {
      if (!(await cursor.hasNext())) break;

      // get the new ID
      const old = await cursor.next();
      const results = await this.pg.query({
        text: 'SELECT * FROM acquisition.acquisitions WHERE journey_id=$1',
        values: [old.journey_id.toString()],
      });

      if (results.rowCount === 0) continue;
      const { _id } = results.rows[0];

      // replace
      console.log('carpools.acquisition_id:\t', old._id.toString(), '->', _id);
      await this.pg.query({
        text: 'UPDATE carpool.carpools SET acquisition_id=$1 WHERE acquisition_id=$2',
        values: [_id, old._id.toString()],
      });

      console.log('fraudchecks.acquisition_id:\t', old._id.toString(), '->', _id);
      await this.pg.query({
        text: 'UPDATE fraudcheck.fraudchecks SET acquisition_id=$1 WHERE acquisition_id=$2',
        values: [_id, old._id.toString()],
      });

      console.log('incentives.acquisition_id:\t', old._id.toString(), '->', _id);
      await this.pg.query({
        text: 'UPDATE policy.incentives SET acquisition_id=$1 WHERE acquisition_id=$2',
        values: [_id, old._id.toString()],
      });
    }
  }

  private async fixApplications(): Promise<void> {
    console.log('\n[fix applications]');
    const cursor = this.db.collection('applications').find({});

    while (true) {
      if (!(await cursor.hasNext())) break;

      // get the new ID
      const old = await cursor.next();
      const results = await this.pg.query({
        text: 'SELECT * FROM application.applications WHERE name=$1 AND created_at=$2',
        values: [old.name, old.created_at],
      });

      if (results.rowCount === 0) continue;
      const { _id } = results.rows[0];

      // replace
      console.log('acquisitions.application_id:\t', old._id.toString(), '->', _id);
      await this.pg.query({
        text: 'UPDATE acquisition.acquisitions SET application_id=$1 WHERE application_id=$2',
        values: [_id, old._id.toString()],
      });
    }
  }

  private async fixOperators(): Promise<void> {
    console.log('\n[fix operators]');
    const cursor = this.db.collection('operators').find({});

    while (true) {
      if (!(await cursor.hasNext())) break;

      // get the new ID
      const old = await cursor.next();
      const results = await this.pg.query({
        text: 'SELECT * FROM operator.operators WHERE name=$1 AND siret=$2',
        values: [old.nom_commercial, old.company.siret],
      });

      if (results.rowCount === 0) continue;
      const { _id } = results.rows[0];

      // replace
      console.log('acquisitions.operator_id:\t', old._id.toString(), '->', _id);
      await this.pg.query({
        text: 'UPDATE acquisition.acquisitions SET operator_id=$1 WHERE operator_id=$2',
        values: [_id, old._id.toString()],
      });

      console.log('applications.owner_id:\t\t', old._id.toString(), '->', _id);
      await this.pg.query({
        text: 'UPDATE application.applications SET owner_id=$1 WHERE owner_id=$2',
        values: [_id, old._id.toString()],
      });

      console.log('users.operator_id:\t\t', old._id.toString(), '->', _id);
      await this.pg.query({
        text: 'UPDATE auth.users SET operator_id=$1 WHERE operator_id=$2',
        values: [_id, old._id.toString()],
      });

      console.log('carpools.operator_id:\t\t', old._id.toString(), '->', _id);
      await this.pg.query({
        text: 'UPDATE carpool.carpools SET operator_id=$1 WHERE operator_id=$2',
        values: [_id, old._id.toString()],
      });
    }
  }

  private async fixTerritories(): Promise<void> {
    console.log('\n[fix territories]');
    const cursor = this.db.collection('territories').find({});

    while (true) {
      if (!(await cursor.hasNext())) break;

      // get the new ID
      const old = await cursor.next();
      const results = await this.pg.query({
        text: 'SELECT * FROM territory.territories WHERE name=$1',
        values: [old.name],
      });

      if (results.rowCount === 0) continue;
      const { _id } = results.rows[0];

      // replace
      console.log('users.territory_id:\t', old._id.toString(), '->', _id);
      await this.pg.query({
        text: 'UPDATE auth.users SET territory_id=$1 WHERE territory_id=$2',
        values: [_id, old._id.toString()],
      });

      console.log('policies.territory_id:\t', old._id.toString(), '->', _id);
      await this.pg.query({
        text: 'UPDATE policy.policies SET territory_id=$1 WHERE territory_id=$2',
        values: [_id, old._id.toString()],
      });
    }
  }
}
