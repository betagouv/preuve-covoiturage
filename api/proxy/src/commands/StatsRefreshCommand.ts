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
  ];

  constructor(protected kernel: KernelInterfaceResolver) {}

  public async call({ databaseUri }): Promise<ResultType> {
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
