import { command, CommandInterface, CommandOptionType, KernelInterfaceResolver } from '@ilos/common';
import { promisify } from 'util';
import { PostgresConnection, Cursor } from '@ilos/connection-postgres';

@command()
export class FraudCheckProcessCommand implements CommandInterface {
  protected readonly processAction = 'fraud:check';
  protected readonly processAllAction = 'fraud:checkAll';

  static readonly signature: string = 'fraudcheck:process [id]';
  static readonly description: string = 'Start fraud check process';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-d, --detach',
      description: 'Process with a queue',
    },
    {
      signature: '-m, --method <method>',
      description: 'Process only specified method',
    },
    {
      signature: '-a, --after <date>',
      description: 'Process all acquisition id after given date',
    },
    {
      signature: '-u, --database-uri <uri>',
      description: 'Connection string to the database',
      default: process.env.APP_POSTGRES_URL,
    },
    {
      signature: '-t, --table <table>',
      description: 'Acquisition id table name',
      default: 'common.carpools',
    },
  ];

  constructor(protected kernel: KernelInterfaceResolver) {}

  public async call(id, options): Promise<string> {
    const { method, after, databaseUri, table, detach } = options;

    if (id) {
      await this.processOne(id, detach, method);
      return `Operation done for ${id}`;
    }

    if (!databaseUri || !table) {
      return 'If id is not provided, you must specify a database uri and a table';
    }

    let whereClause = '';
    const values = [];

    if (after) {
      const afterDate = new Date(after);
      console.log(`Processing for acquisition after ${afterDate.toISOString()}`);
      whereClause = `WHERE created_at > $1::timestamp`;
      values.push(afterDate);
    }

    const connection = new PostgresConnection({
      connectionString: options.databaseUri,
    });

    await connection.up();

    const client = await connection.getClient().connect();
    const query = `
    SELECT
      acquisition_id
    FROM ${table}
      ${whereClause}
    `;

    const cursor = client.query(new Cursor(query, values));

    const promisifiedCursorRead = promisify(cursor.read.bind(cursor));
    const ROW_COUNT = 10;
    let count = 0;

    do {
      const result = await promisifiedCursorRead(ROW_COUNT);
      count = result.length;
      for (const line of result) {
        const { acquisition_id } = line;
        try {
          await this.processOne(acquisition_id, detach, method);
          console.log(`Operation done for ${acquisition_id}`);
        } catch (e) {
          console.log(`Operation failed for ${acquisition_id} (${e.message})`);
        }
      }
    } while (count !== 0);

    await client.release();
    await connection.down();
    return 'Done!';
  }

  protected async processOne(acquisitionId: number, detach = false, method?: string): Promise<void> {
    const action = method ? this.processAction : this.processAllAction;

    const context = {
      call: {
        user: {},
      },
      channel: {
        service: 'fraud',
        transport: 'cli',
      },
    };

    const params: any = {
      acquisition_id: acquisitionId,
    };

    if (method) {
      params.method = method;
    }

    if (detach) {
      return this.kernel.notify(action, params, context);
    }

    return this.kernel.call(action, params, context);
  }
}
