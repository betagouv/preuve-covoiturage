import { handler } from '@ilos/common';
import { PoolClient, PostgresConnection } from '@ilos/connection-postgres';
import { Action as AbstractAction } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware/dist';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/monitoring/statsrefresh.contract';
import { alias } from '../shared/monitoring/statsrefresh.schema';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares('proxy'), ['validate', alias]],
})
export class StatsRefreshAction extends AbstractAction {
  private cn: PoolClient;

  constructor(protected pg: PostgresConnection) {
    super();
  }

  public async handle({ schema }: ParamsInterface): Promise<ResultInterface> {
    try {
      this.cn = await this.pg.getClient().connect();

      const views = await this.cn.query({
        text: 'SELECT matviewname FROM pg_matviews WHERE schemaname = $1',
        values: [schema],
      });

      if (!views.rowCount) {
        console.info('No materialized views to refresh');
        return;
      }

      for (const { matviewname: table } of views.rows) {
        const bench = new Date().getTime();
        await this.cn.query(`REFRESH MATERIALIZED VIEW stats.${table}`);
        const ms = (new Date().getTime() - bench) / 1000;
        console.info(`[stats:refresh] Refreshed stats.${table} in ${ms} seconds`);
      }
    } catch (e) {
      console.error(`[stats:refresh] ${e.message}`);
    } finally {
      this.cn.release();
    }
  }
}
