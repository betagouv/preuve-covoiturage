import { handler } from '@ilos/common';
import { PoolClient, PostgresConnection } from '@ilos/connection-postgres';
import { Action as AbstractAction } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware/dist';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/monitoring/statsrefresh.contract';
import { alias } from '../shared/monitoring/statsrefresh.schema';

const CronFrequencies = ['daily', 'weekly', 'monthly'] as const;
type CronFrequency = typeof CronFrequencies[number];

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

      // get the frequencies that can run today
      const frequencies = this.todayFrequencies();

      // Filter the tables based on today's frequencies
      // Unprefixed tables will be run every day
      const tables = views.rows
        .map((t: { matviewname: string }) => t.matviewname)
        .map((table: string) => {
          const [freq] = table.split('_', 1);
          return {
            table,
            freq: CronFrequencies.indexOf(freq as CronFrequency) > -1 ? freq : 'daily',
          };
        })
        .filter(({ freq }) => frequencies.indexOf(freq as CronFrequency) > -1)
        .map(({ table }: { table: string }) => table);

      console.info(`[stats:refresh] Refresh materialised views: ${tables.sort().join(', ')}`);

      for (const table of tables) {
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

  private todayFrequencies(d?: Date | string): CronFrequency[] {
    const freq: CronFrequency[] = ['daily'];
    const now = new Date(d || new Date());

    // on Mondays
    if (now.getDay() === 1) freq.push('weekly');

    // on first day of the month
    if (now.getDate() === 1) freq.push('monthly');

    return freq;
  }
}
