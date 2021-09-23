import { Action } from '@ilos/core';
import { handler, InitHookInterface, KernelInterfaceResolver } from '@ilos/common';
import { PostgresConnection } from '@ilos/connection-postgres';

import { signature, handlerConfig } from '../shared/trip/cacheWarmCron.contract';
import { ApiGraphTimeMode } from '../shared/trip/common/interfaces/ApiGraphTimeMode';

@handler({
  ...handlerConfig,
  // middlewares: [['channel.service.only', [handlerConfig.service]]],
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

    // get all operators and territories with linked users to avoid
    // generating stats for inactive partners
    const { operators, territories } = await this.getActivePartners();

    await this.buildOperators(operators);
    await this.buildTerritories(territories);
    await this.buildPublic();
  }

  private async getActivePartners(): Promise<Partial<{ operators: number[]; territories: number[] }>> {
    return this.kernel.call(
      'user:hasUsers',
      {},
      {
        channel: { service: handlerConfig.service },
      },
    );
  }

  private async buildOperators(operators: number[]): Promise<void> {
    if (!operators) return;
    for (const operator_id of operators) {
      console.info(`> Warm cache for operator ${operator_id}`);
      for (const group_by of Object.keys(ApiGraphTimeMode)) {
        await this.kernel.notify(
          'trip:stats',
          {
            operator_id,
            tz: 'Europe/Paris',
            date: { start: this.oneYearAgo() },
            group_by: group_by.toLowerCase(),
          },
          {
            channel: { service: handlerConfig.service, metadata: { timeout: 0 } },
            call: { user: { operator_id, permissions: ['operator.trip.stats'] } },
          },
        );
      }
    }
  }

  private async buildTerritories(territories: number[]): Promise<void> {
    if (!territories) return;
    for (const territory_id of territories) {
      console.info(`> Warm cache for territory ${territory_id}`);
      for (const group_by of Object.keys(ApiGraphTimeMode)) {
        await this.kernel.notify(
          'trip:stats',
          {
            territory_id,
            tz: 'Europe/Paris',
            date: { start: this.oneYearAgo() },
            group_by: group_by.toLowerCase(),
          },
          {
            channel: { service: handlerConfig.service, metadata: { timeout: 0 } },
            call: { user: { authorizedTerritories: [territory_id], permissions: ['territory.trip.stats'] } },
          },
        );
      }
    }
  }

  private async buildPublic(): Promise<void> {
    for (const group_by of Object.keys(ApiGraphTimeMode)) {
      await this.kernel.notify(
        'trip:stats',
        {
          tz: 'Europe/Paris',
          date: { start: this.oneYearAgo() },
          group_by: group_by.toLowerCase(),
        },
        {
          channel: { service: handlerConfig.service, metadata: { timeout: 0 } },
          call: { user: { permissions: ['registry.trip.stats'] } },
        },
      );
    }
  }

  private oneYearAgo(): string {
    const year = new Date().getFullYear() - 1;
    const past = new Date();
    past.setFullYear(year);

    return `${past.toISOString().substr(0, 10)}T00:00:00Z`;
  }
}
