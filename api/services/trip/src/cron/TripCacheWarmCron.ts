import { Action } from '@ilos/core';
import { handler, InitHookInterface, KernelInterfaceResolver } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { signature, handlerConfig } from '../shared/trip/cacheWarmCron.contract';

@handler({
  ...handlerConfig,
  middlewares: [['channel.service.only', [handlerConfig.service]]],
})
export class TripCacheWarmCron extends Action implements InitHookInterface {
  constructor(private kernel: KernelInterfaceResolver, private pg: PostgresConnection) {
    super();
  }

  async init(): Promise<void> {
    await this.kernel.notify(signature, undefined, {
      call: {
        user: {},
      },
      channel: {
        service: handlerConfig.service,
        metadata: {
          repeat: {
            cron: '17 5 * * *',
          },
          jobId: `${handlerConfig.service}.${handlerConfig.method}`,
        },
      },
    });
  }

  public async handle(): Promise<void> {
    // clean up cache table
    await this.pg.getClient().query('TRUNCATE trip.stat_cache');

    // fetch the list of operators and territories as a list of ID
    const response = await this.kernel.call(
      'user:hasUsers',
      {},
      {
        channel: { service: handlerConfig.service },
      },
    );

    // warm operators
    if ('operators' in response) {
      for (const operator_id of response.operators) {
        console.log(`> Warm cache for operator ${operator_id}`);
        await this.kernel.notify(
          'trip:stats',
          {
            operator_id: [operator_id],
            date: { start: this.oneYearAgo() },
          },
          {
            channel: { service: handlerConfig.service },
            call: { user: { permissions: ['trip.stats'] } },
          },
        );
      }
    }

    // warm territories
    if ('territories' in response) {
      for (const territory_id of response.territories) {
        console.log(`> Warm cache for territory ${territory_id}`);
        await this.kernel.notify(
          'trip:stats',
          {
            territory_id: [territory_id],
            date: { start: this.oneYearAgo() },
          },
          {
            channel: { service: handlerConfig.service },
            call: { user: { permissions: ['trip.stats'] } },
          },
        );
      }
    }

    // warm global cache
    await this.kernel.notify(
      'trip:stats',
      {
        date: { start: this.oneYearAgo() },
      },
      {
        channel: { service: handlerConfig.service },
        call: { user: { permissions: ['trip.stats'] } },
      },
    );
  }

  private oneYearAgo(): string {
    const year = new Date().getFullYear() - 1;
    const past = new Date();
    past.setFullYear(year);

    return `${past.toISOString().substr(0, 10)}T00:00:00Z`;
  }
}
