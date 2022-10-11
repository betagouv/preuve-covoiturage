import { command, CommandInterface, CommandOptionType, ResultType, KernelInterfaceResolver } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

@command()
export class StatsRefreshCommand implements CommandInterface {
  static readonly signature: string = 'stats:refresh';
  static readonly description: string = 'Refresh stats materialized views';
  static readonly options: CommandOptionType[] = [
    {
      signature: '-u, --database-uri <uri>',
      description: 'Connection string to the database',
      default: process.env.APP_POSTGRES_URL,
    },
    {
      signature: '-t, --timeout',
      description: 'pg query timeout',
      default: 2 * 86_400_000, // 2 hours
    },
  ];

  constructor(protected kernel: KernelInterfaceResolver) {}

  public async call({ databaseUri, timeout }): Promise<ResultType> {
    // override the environment variable.
    // the command is run once and this config override will not
    // affect the global postgresql timeout
    process.env.APP_POSTGRES_TIMEOUT = `${timeout}`;

    const connection = new PostgresConnection({ connectionString: databaseUri });
    await connection.up();
    const client = await connection.getClient().connect();

    // create metadata table
    const response = await client.query(`SELECT matviewname FROM pg_matviews WHERE schemaname = 'stats'`);
    if (!response.rowCount) {
      console.info('No materialized views to refresh');
      return 0;
    }

    for (const { matviewname: table } of response.rows) {
      const bench = new Date().getTime();
      await client.query(`REFRESH MATERIALIZED VIEW stats.${table}`);
      const ms = (new Date().getTime() - bench) / 1000;
      console.info(`[stats:refresh] Refreshed stats.${table} in ${ms} seconds`);
    }

    return 'Done!';
  }
}
