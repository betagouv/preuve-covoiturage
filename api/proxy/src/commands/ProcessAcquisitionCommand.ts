import { promisify } from 'util';
import {
  command,
  CommandInterface,
  CommandOptionType,
  ResultType,
  KernelInterfaceResolver,
  ContextType,
} from '@ilos/common';
import { PostgresConnection, Cursor } from '@ilos/connection-postgres';

@command()
export class ProcessAcquisitionCommand implements CommandInterface {
  static readonly signature: string = 'process:acquisition';
  static readonly description: string = 'Push acquisition into the pipeline';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-u, --database-uri <uri>',
      description: 'Connection string to the database',
      default: process.env.APP_POSTGRES_URL,
    },
    {
      signature: '-t, --table <table>',
      description: 'Source table',
      default: 'acquisition.acquisitions',
    },
    {
      signature: '-s, --startdate <startdate>',
      description: 'Select carpool with a created_at date after <startdate>',
      default: '2022-01-01T00:00:00+0100',
    },
    {
      signature: '-e, --enddate <enddate>',
      description: 'Select carpool with a created_at date before <enddate>',
      default: '2022-02-01T00:00:00+0100',
    },
    {
      signature: '-l, --limit <limit>',
      description: 'Limit to apply',
      coerce: (s: string): number => Number(s),
    },
  ];

  constructor(protected kernel: KernelInterfaceResolver) {}

  public async call(options): Promise<ResultType> {
    const readConnection = new PostgresConnection({ connectionString: options.databaseUri });
    await readConnection.up();
    const readClient = await readConnection.getClient().connect();

    const handler = this.kernel.getContainer().getHandler({ signature: 'normalization:process' }) as any;

    // select acquisition missing a carpool
    const query = {
      text: `
        SELECT
          aa._id,
          aa.journey_id,
          aa.operator_id,
          aa.application_id,
          aa.payload,
          aa.created_at
        FROM ${options.table} AS aa
        LEFT JOIN carpool.carpools
        ON aa._id = carpool.carpools.acquisition_id::integer
        WHERE
          carpool.carpools.acquisition_id IS NULL
          AND payload#>>'{driver,start,datetime}' >= $2
          AND payload#>>'{driver,start,datetime}' <  $3
        LIMIT $1
      `,
      values: [options.limit, options.startdate, options.enddate],
    };

    const cursorCb = readClient.query(new Cursor(query.text, query.values));
    const cursor = promisify(cursorCb.read.bind(cursorCb));
    let count = 0;
    const ROW_COUNT = 10000;

    const context: ContextType = {
      channel: {
        // transport: 'cli',
        service: 'acquisition', // this is necessary to have right permission on normalization service
      },
    };

    do {
      const result = await cursor(ROW_COUNT);
      count = result.length;

      for (const line of result) {
        try {
          const params = {
            ...line,
            created_at: line.created_at.toISOString(),
          };
          await handler({ params, context });
          console.info(`> Operation done for ${line._id}`);
        } catch (e) {
          console.error(`> FAILED ${line._id}`);
          console.error(e);
        }
      }
    } while (count !== 0);

    return 'Done!';
  }
}
