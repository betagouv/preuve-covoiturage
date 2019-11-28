// tslint:disable: no-console
import { command, CommandInterface, CommandOptionType, ResultType, KernelInterfaceResolver } from '@ilos/common';
import { get } from 'lodash';
import { MongoConnection, ObjectId } from '@ilos/connection-mongo';
import { PostgresConnection } from '@ilos/connection-postgres';

@command()
export class SyncMongoCommand implements CommandInterface {
  static readonly signature: string = 'sync:mongo';
  static readonly description: string = 'Sync mongo journeys into acquisition';
  static readonly options: CommandOptionType[] = [
    {
      signature: '--mongo-uri <uri>',
      description: 'Connection string to the database',
      default: process.env.APP_MONGO_URL,
    },
    {
      signature: '--pg-uri <uri>',
      description: 'Connection string to the database',
      default: process.env.APP_POSTGRES_URL,
    },
    {
      signature: '-d, --mongo-db <db>',
      description: 'Database to user',
      default: process.env.APP_MONGO_DB,
    },
    {
      signature: '-c, --collection <collection>',
      description: 'Collection of journey to import',
      default: 'journeys',
    },
    {
      signature: '-t, --tag <tag>',
      description: 'Tag of this operation',
      default: 'done',
    },
    {
      signature: '-l, --limit <limit>',
      description: 'Limit to apply',
      // tslint:disable-next-line: no-unnecessary-callback-wrapper
      coerce: (s: string) => Number(s),
    },
  ];

  constructor(protected kernel: KernelInterfaceResolver) {}

  // tslint:disable-next-line: no-shadowed-variable
  public async call(options): Promise<ResultType> {
    const mongoConnection = new MongoConnection({
      connectionString: options.mongoUri,
    });
    const pgConnection = new PostgresConnection({
      connectionString: options.pgUri,
    });

    await mongoConnection.up();
    await pgConnection.up();
    const mongoClient = mongoConnection.getClient();
    const pgClient = await pgConnection.getClient().connect();

    const collection = mongoClient.db(options.mongoDb).collection(options.collection);
    let cursor = collection.find({ _sync_metadata: { $nin: ['done', 'duplicate'] } }, { sort: { created_at: 1 } });
    let _id: string = null;
    let _oid: ObjectId = null;
    let count = 0;

    if (options.limit) {
      cursor = cursor.limit(options.limit);
    }

    // load mapping table
    let mapResults;
    try {
      mapResults = await pgClient.query('SELECT * FROM public.mapids');
    } catch (e) {
      console.log('ERROR', e.message);
      console.error(`
      You must import operators, territories, applications and users with:
      'yarn workspace @pdc/proxy ilos mapid'
      command before running sync:mongo.`);

      pgClient.release();
      await mongoConnection.down();
      await pgConnection.down();
      return '';
    }

    // load journeys
    const found = await cursor.count();

    // tslint:disable-next-line: no-constant-condition
    while (true) {
      if (!(await cursor.hasNext())) break;
      let doc: any = { _id: undefined };

      try {
        doc = await cursor.next();

        // it gets deleted from the payload below
        _oid = doc._id;
        _id = doc._id.toString();
        const created_at = doc.created_at;

        // FIX ON LEGACY JOURNEY
        doc.operator_id = get(doc, 'operator._id', doc.operator_id).toString();

        const op_map = mapResults.rows.find((r) => r.key === 'operator_id' && r.object_id === doc.operator_id);
        if (op_map) doc.operator_id = op_map.pg_id;

        doc.driver.incentives = [];
        doc.passenger.incentives = [];

        if ('cost' in doc.passenger && !doc.passenger.contribution) {
          doc.passenger.contribution = doc.passenger.cost < 50 ? doc.passenger.cost * 100 : doc.passenger.cost;
        }

        if ('cost' in doc.driver && !doc.driver.revenue) {
          doc.driver.revenue = doc.driver.cost < 50 ? doc.driver.cost * 100 : doc.driver.cost;
        }

        doc.passenger.identity.travel_pass_name = get(
          doc,
          'passenger.identity.travel_pass.name',
          doc.passenger.identity.travel_pass_name,
        );
        doc.passenger.identity.travel_pass_user_id = get(
          doc,
          'passenger.identity.travel_pass.user_id',
          doc.passenger.identity.travel_pass_user_id,
        );

        delete doc._id;
        delete doc.safe_journey_id;
        delete doc.aom;
        delete doc.__v;
        delete doc.trip_id;
        delete doc.validation;
        delete doc.status;
        delete doc.deletedAt;
        delete doc.updatedAt;
        delete doc.createdAt;
        delete doc.created_at;
        delete doc.operator;

        delete doc.passenger.start.aom;
        delete doc.passenger.start.postcodes;
        delete doc.passenger.start.territory_id;
        delete doc.passenger.end.aom;
        delete doc.passenger.end.postcodes;
        delete doc.passenger.end.territory_id;
        delete doc.passenger.calc_distance;
        delete doc.passenger.calc_duration;
        delete doc.passenger.calc_duration;
        delete doc.passenger.duration;
        delete doc.passenger.incentive;
        delete doc.passenger.remaining_fee;
        delete doc.passenger.expense;
        delete doc.passenger.cost;

        delete doc.driver.start.aom;
        delete doc.driver.start.postcodes;
        delete doc.driver.start.territory_id;
        delete doc.driver.end.aom;
        delete doc.driver.end.postcodes;
        delete doc.driver.end.territory_id;
        delete doc.driver.calc_distance;
        delete doc.driver.calc_duration;
        delete doc.driver.duration;
        delete doc.driver.incentive;
        delete doc.driver.remaining_fee;
        delete doc.driver.expense;
        delete doc.driver.cost;

        // save in acquisition
        await pgClient.query('BEGIN');
        const insert = await pgClient.query({
          text: `
            INSERT INTO acquisition.acquisitions
            ( created_at, application_id, operator_id, journey_id, payload )
            VALUES ( $1, $2, $3, $4, $5 )
            ON CONFLICT DO NOTHING
            RETURNING _id
          `,
          values: [
            created_at,
            doc.application_id ? doc.application_id.toString() : 'unknown',
            doc.operator_id.toString(),
            doc.journey_id,
            doc,
          ],
        });

        if (!insert.rowCount) {
          console.info(`🔁 Journey ${_id} skipped`);
          await pgClient.query('ROLLBACK');
          await collection.updateOne({ _id: _oid }, { $set: { _sync_metadata: 'duplicate' } });
          continue;
        }

        const pg_id = insert.rows[0]._id;

        // flag the imported journey as 'done' in _sync_metadata
        await collection.updateOne({ _id: _oid }, { $set: { _sync_metadata: 'done' } });
        await pgClient.query('COMMIT');
        console.info(`🔁 Journey ${_id} --> ${pg_id} synced`);

        // tslint:disable-next-line: no-increment-decrement
        count++;
      } catch (e) {
        await collection.updateOne({ _id: _oid }, { $set: { _sync_metadata: `ERROR ${e.message}` } });
        await pgClient.query('ROLLBACK');
        console.error(`🔁 Journey failed to import ${_id} (${e.message})`);
      }
    }

    pgClient.release();
    await mongoConnection.down();
    await pgConnection.down();

    console.log('Synched', count, 'of', options.limit || found, 'in a total of', found);
    return '';
  }
}
