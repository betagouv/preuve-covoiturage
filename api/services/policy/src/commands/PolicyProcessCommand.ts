/**
 * Process policies on a set of trips from the `policy.trips` table
 *
 * ! Note: run all these commands in the workspace. prefix with before the policy:process action:
 *         `docker-compose run api yarn workspace @pdc/service-policy ilos`
 *
 * The basic signature is to pass a trip_id as this :
 * $ ilos policy:process {trip_id}
 *
 * Run the command as detached (requires workers to handle the jobs from the Redis queues)
 * $ ilos policy:process {trip_id} -d
 *
 * Leaving the {trip_id} will process all matching trips which can be filtered by :
 * -a / --after         pass a start date (e.g. '2020-01-01T00:00:00Z')
 * -u / --until         pass an end date (e.g. '2020-01-01T00:00:00Z')
 * -t / --territory     pass a territory ID from the `territory.territories` table
 * -o / --operator      pass a operator ID from the `operator.operators` table
 * -l / --limit         pass an integer to limit the number of trips to process
 * -u / --database-uri  pass a PostgreSQL URI to connect. Defaults to APP_POSTGRES_URL env var
 *                      e.g. postgresql://{username}:{password}@{host}:{port}/{database}
 */

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
      signature: '-o, --operator <operator>',
      description: 'Process all trip id given operator',
    },
    {
      signature: '-b, --batch <batch>',
      description: 'Batch size',
      default: 10000,
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

  private context = {
    call: {
      user: {},
    },
    channel: {
      service: 'campaign',
      transport: 'cli',
    },
  };

  constructor(protected kernel: KernelInterfaceResolver) {}

  public async call(id: string, options): Promise<string> {
    const { territory, operator, after, until, databaseUri, detach, limit, batch } = options;

    if (id) {
      await this.process(id, detach);
      return `>> Operation done for ${id}`;
    }

    if (!databaseUri) {
      return '>> If id is not provided, you must specify a database uri';
    }

    // cap the batch size by the limit
    const batchSize = limit && limit < batch ? limit : batch;

    const text = [];
    const values = [];

    if (after) {
      text.push('datetime > $#::timestamp');
      values.push(new Date(after));
    }

    if (until) {
      text.push('datetime < $#::timestamp');
      values.push(new Date(until));
    }

    if (territory) {
      text.push('(start_territory_id = $#::int OR end_territory_id = $#::int)');
      values.push(territory);
      values.push(territory);
    }

    if (operator) {
      text.push('operator_id = $#::int');
      values.push(operator);
    }

    // build the WHERE clause and replace $# by their increasing indexes
    const whereClause =
      text.length === 0
        ? ''
        : 'WHERE ' +
          text
            .join(' AND ')
            .split('$#')
            .reduce(
              (acc, current, idx, origin) =>
                idx === origin.length - 1 ? `${acc}${current}` : `${acc}${current}$${idx + 1}`,
              '',
            );

    const connection = new PostgresConnection({
      connectionString: databaseUri,
    });

    await connection.up();

    const client = await connection.getClient().connect();
    const query = `
      SELECT
        distinct trip_id
      FROM ${this.table}
        ${whereClause}
        ${limit ? `LIMIT ${limit}` : ''}
    `;

    const cursor = client.query(new Cursor(query, values));

    const promisifiedCursorRead = promisify(cursor.read.bind(cursor));
    let count = 0;

    do {
      const result = await promisifiedCursorRead(batchSize);
      count = result.length;

      const ids = [];
      for (const line of result) {
        ids.push(line.trip_id);
      }

      try {
        if (ids.length) {
          console.log(`>> process ${ids.length} trips`);
          await this.process(ids, detach);
        }
      } catch (e) {
        console.log(`>> Operation failed for (${e.message})`);
      }
    } while (count > 0);

    client.release();
    await connection.down();

    return '';
  }

  protected async process(ids: string | string[], detach = false): Promise<void> {
    const trips = Array.isArray(ids) ? ids : [ids];

    if (detach) {
      return this.kernel.notify(this.processAction, { trips }, this.context);
    }

    return this.kernel.call(this.processAction, { trips }, this.context);
  }
}
