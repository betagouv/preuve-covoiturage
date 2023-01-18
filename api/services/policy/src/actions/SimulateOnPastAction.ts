import Redis from 'ioredis';
import { ConfigInterfaceResolver, handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyGroupIdAndApplyGroupPermissionMiddlewares, validateDateMiddleware } from '@pdc/provider-middleware';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/simulateOnPast.contract';

import { alias } from '../shared/policy/simulateOnPast.schema';
import {
  TripRepositoryProviderInterfaceResolver,
  TerritoryRepositoryProviderInterfaceResolver,
  SerializedPolicyInterface,
} from '../interfaces';
import { Policy } from '../engine/entities/Policy';
import { MetadataStore } from '../engine/entities/MetadataStore';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    validateDateMiddleware({
      startPath: 'start_date',
      endPath: 'end_date',
      minStart: () => new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 31 * 5),
      maxEnd: () => new Date(),
    }),
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      territory: 'territory.policy.simulate.past',
      registry: 'registry.policy.simulate.past',
    }),
  ],
})
export class SimulateOnPastAction extends AbstractAction {
  private redis: Redis.Redis;

  constructor(
    private tripRepository: TripRepositoryProviderInterfaceResolver,
    private config: ConfigInterfaceResolver,
    private territoryRepository: TerritoryRepositoryProviderInterfaceResolver,
  ) {
    super();
    this.redis = new Redis(this.config.get('redis.connectionString'), { keyPrefix: 'simulation:' });
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const today = new Date();
    const start_date = new Date();
    start_date.setMonth(today.getMonth() - params.months);

    // 1. Find selector and instanciate policy
    const territory_selector = await this.territoryRepository.findSelectorFromId(params.territory_id);
    const serialized_policy: SerializedPolicyInterface = {
      ...params,
      status: 'active',
      start_date,
      end_date: today,
      incentive_sum: 0,
      territory_selector,
      _id: 1,
    };
    const policy = await Policy.import(serialized_policy);
    // 2. Start a cursor to find trips
    const cursor = this.tripRepository.findTripByPolicy(policy, policy.start_date, policy.end_date);
    let done = false;

    let carpool_subsidized = 0;
    let amount = 0;

    const store = new MetadataStore();
    do {
      const results = await cursor.next();
      done = results.done;
      if (results.value) {
        for (const carpool of results.value) {
          // 3. For each trip, process
          const incentive = await policy.processStateless(carpool);
          const finalIncentive = await policy.processStateful(store, incentive.export());
          const finalAmount = finalIncentive.get();
          if (finalAmount > 0) {
            carpool_subsidized += 1;
          }
          amount += finalAmount;
        }
      }
    } while (!done);

    const result: ResultInterface = {
      trip_subsidized: carpool_subsidized,
      amount,
    };

    this.redis.set(`${params.territory_id}:`, result);
    return result;
  }
}
