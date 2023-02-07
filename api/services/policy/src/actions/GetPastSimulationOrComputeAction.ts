import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware';
import Redis from 'ioredis';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/simulateOnPast.contract';

import { RedisConnection } from '@ilos/connection-redis/dist';
import { alias } from '../shared/policy/simulateOnPast.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      territory: 'territory.policy.simulate.past',
      registry: 'registry.policy.simulate.past',
    }),
  ],
})
export class GetPastSimulationOrComputeAction extends AbstractAction {
  constructor(private connection: RedisConnection) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const today = new Date();
    const start_date = new Date();
    start_date.setMonth(today.getMonth() - params.months);

    // 0. Returns Redis cache result for a given territory and month number if present
    const cachedResult: string = await this.connection.getClient().get(this.getSimulationCachingKey(params));
    if (cachedResult) {
      return JSON.parse(cachedResult);
    }

    //1. Compute async and return / throw ... ?
    // Try retrieve after 45s (configured request Timeout esle throw)
    return result;
  }

  private getSimulationCachingKey(params: ParamsInterface): Redis.KeyType {
    return `simulations:${params.territory_id}:${params.months}`;
  }
}
