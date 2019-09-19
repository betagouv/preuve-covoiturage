import {
  command,
  CommandInterface,
  CommandOptionType,
  ResultType,
  KernelInterfaceResolver,
  handler,
  ContextType,
} from '@ilos/common';
import { MongoConnection } from '@ilos/connection-mongo';

@command()
export class UpgradeJourneyCommand implements CommandInterface {
  static readonly signature: string = 'upgrade:journey <command>';
  static readonly description: string = 'Allow to transform old stored journey into trip';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-u, --database-uri <uri>',
      description: 'Connection string to the database',
      default: process.env.APP_MONGO_URL,
    },
    {
      signature: '-d, --database <db>',
      description: 'Database to user',
      default: 'pdc-local',
    },
    {
      signature: '-c, --collection <collection>',
      description: 'Collection of journey to import',
      default: 'journeys',
    },
    {
      signature: '-t, --tag <tag>',
      description: 'Tag of this operation',
    },
    {
      signature: '-ct, --clean',
      description: 'Clean collection',
    },
    {
      signature: '-l, --limit <limit>',
      description: 'Limit to apply',
      coerce: (s: string) => Number(s),
    },
  ];

  constructor(protected kernel: KernelInterfaceResolver) {}

  public async call(command, options): Promise<ResultType> {
    const connection = new MongoConnection({
      connectionString: options.databaseUri,
    });

    await connection.up();
    const client = connection.getClient();

    const handler = this.kernel.getContainer().getHandler({ signature: command });

    if (!handler) {
      console.error(`Can't find action ${command}, exiting.`);
      return 'Oups!';
    }

    const selector = {};

    if (options.tag && !options.clean) {
      selector['_upgrade_metadata'] = {
        $not: {
          $eq: options.tag,
        },
      };
    }
    const collection = client.db(options.database).collection(options.collection);
    if (options.clean) {
      await collection.updateMany(
        {
          _upgrade_metadata: { $exists: true },
        },
        {
          $unset: {
            _upgrade_metadata: '',
          },
        },
      );
      return 'Collection cleaned!';
    }

    let cursor = collection.find(selector);

    if (options.limit) {
      cursor = cursor.limit(options.limit);
    }

    const context: ContextType = {
      call: {
        user: {},
      },
      channel: {
        transport: 'cli',
        service: 'proxy',
      },
    };

    while (true) {
      if (!(await cursor.hasNext())) {
        break;
      }
      let current: any = {
        _id: undefined,
      };
      try {
        current = await cursor.next();

        // FIX ON LEGACY JOURNEY
        current['operator_id'] = current.operator._id;
        current.driver.start.territory = current.driver.start.aom._id;
        current.driver.end.territory = current.driver.end.aom._id;
        current.passenger.start.territory = current.driver.start.aom._id;
        current.passenger.end.territory = current.driver.end.aom._id;
        current.driver.seats = 0;
        current.driver.incentives = [];
        current.driver.payments = [];
        current.passenger.incentives = [];
        current.passenger.payments = [];

        const r = await (<any>handler).handle(current, context);
        if (options.tag) {
          await collection.updateOne(
            { _id: current._id },
            {
              $set: {
                _upgrade_metadata: options.tag,
              },
            },
          );
        }
        console.info(`Operation done for ${current._id}`);
      } catch (e) {
        console.log(e);
        console.error(`Operation failed on ${current._id}`);
      }
    }
    await connection.down();
    return 'Done!';
  }
}
