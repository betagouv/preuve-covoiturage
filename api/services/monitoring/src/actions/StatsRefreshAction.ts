import { ConfigInterfaceResolver, handler } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';
import { Action as AbstractAction, env } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware/dist';
import { filterTables } from '../helpers/filterTables.helper';
import { todayFrequencies } from '../helpers/todayFrequencies.helper';
import { MatviewItem } from '../interfaces/StatsRefreshInterfaces';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/monitoring/statsrefresh.contract';
import { alias } from '../shared/monitoring/statsrefresh.schema';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares('proxy'), ['validate', alias]],
})
export class StatsRefreshAction extends AbstractAction {
  constructor(protected pg: PostgresConnection, protected config: ConfigInterfaceResolver) {
    super();
  }

  public async handle({ schema }: ParamsInterface): Promise<ResultInterface> {
    if (env.or_false(APP_DISABLE_STATS_REFRESH)) {
      return;
    }
    const cn = await this.pg.getClient().connect();
    try {
      const views = await cn.query<MatviewItem>({
        text: 'SELECT matviewname FROM pg_matviews WHERE schemaname = $1',
        values: [schema],
      });

      if (!views.rowCount) {
        console.info('No materialized views to refresh');
        return;
      }

      // get the frequencies that can run today
      const frequencies = todayFrequencies();

      // Filter the tables based on today's frequencies
      // Unprefixed tables will be run every day
      // Refreshing can be skipped by add 'schema.matview' to the config.refresh.skip list
      const tables = filterTables(this.config, frequencies, schema, views.rows);

      console.info(`[monitoring:stats:refresh] Refresh materialised views: ${tables.sort().join(', ')}`);

      for (const table of tables) {
        const bench = new Date().getTime();
        await cn.query(`REFRESH MATERIALIZED VIEW stats.${table}`);
        const ms = (new Date().getTime() - bench) / 1000;
        console.info(`[monitoring:stats:refresh] Refreshed stats.${table} in ${ms} seconds`);
      }
    } catch (e) {
      console.error(`[monitoring:stats:refresh] ${e.message}`);
    } finally {
      cn.release();
    }
  }
}
