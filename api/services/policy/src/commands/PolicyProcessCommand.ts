import { command, CommandInterface, CommandOptionType, KernelInterfaceResolver } from '@ilos/common';
import { promisify } from 'util';
import { PostgresConnection, Cursor } from '@ilos/connection-postgres';

@command()
export class PolicyProcessCommand implements CommandInterface {
  protected readonly processAction = 'campaign:apply';
  protected readonly table = 'policy.trips';

  static readonly signature: string = 'policy:process [id]';
  static readonly description: string = 'Apply policies on carpools';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-d, --detach',
      description: 'Process with a queue',
    },
    {
      signature: '-a, --after <date>',
      description: 'Process all trip id after given date',
    },
    {
      signature: '-u, --until <date>',
      description: 'Process all trip id until given date',
    },
    {
      signature: '-t, --territory <territory>',
      description: 'Process all trip id given territory',
    },
    {
      signature: '-l, --limit <limit>',
      description: 'Limit',
    },
    {
      signature: '-u, --database-uri <uri>',
      description: 'Connection string to the database',
      default: process.env.APP_POSTGRES_URL,
    },
  ];

  constructor(protected kernel: KernelInterfaceResolver) {}

  public async call(id, options): Promise<string> {
    const { territory, after, until, databaseUri, detach, limit } = options;

    if (id) {
      await this.processOne(id, detach);
      return `Operation done for ${id}`;
    }

    if (!databaseUri) {
      return 'If id is not provided, you must specify a database uri';
    }

    let whereClause = '';
    const values = [];

    if (territory && after) {
      whereClause = `WHERE datetime > $1::timestamp AND datetime < $2::timestamp AND (start_territory_id = $3::int OR end_territory_id = $3::int)`;
      values.push(new Date(after), new Date(until).toISOString(), territory);
    } else if (territory) {
      whereClause = 'WHERE start_territory_id = $1::int OR end_territory_id = $1::int';
      values.push(territory);
    } else if (after) {
      const afterDate = new Date(after);
      console.log(`Processing for trip after ${afterDate.toISOString()}`);
      whereClause = `WHERE datetime > $1::timestamp`;
      values.push(afterDate);
    }

    const connection = new PostgresConnection({
      connectionString: databaseUri,
    });

    await connection.up();

    const client = await connection.getClient().connect();
    const query = `
    SELECT
      trip_id
    FROM ${this.table}
      ${whereClause}
      ${limit ? `LIMIT ${limit}` : ''}
    `;

    const cursor = client.query(new Cursor(query, values));

    const promisifiedCursorRead = promisify(cursor.read.bind(cursor));
    const ROW_COUNT = 1000;
    let count = 0;

    do {
      const result = await promisifiedCursorRead(ROW_COUNT);
      count = result.length;
      for (const line of result) {
        const { trip_id } = line;
        try {
          await this.processOne(trip_id, detach);
          console.log(`Operation done for ${trip_id}`);
        } catch (e) {
          console.log(`Operation failed for ${trip_id} (${e.message})`);
        }
      }
    } while (count !== 0);

    await client.release();
    await connection.down();
    return 'Done!';
  }

  protected async processOne(tripId: number, detach = false): Promise<void> {
    const context = {
      call: {
        user: {},
      },
      channel: {
        service: 'campaign',
        transport: 'cli',
      },
    };

    const params: any = {
      trip_id: tripId,
    };

    if (detach) {
      return this.kernel.notify(this.processAction, params, context);
    }

    return this.kernel.call(this.processAction, params, context);
  }
}
