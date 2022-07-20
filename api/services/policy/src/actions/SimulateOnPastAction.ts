import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyGroupIdAndApplyGroupPermissionMiddlewares, validateDateMiddleware } from '@pdc/provider-middleware';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/simulateOnPast.contract';

import { alias } from '../shared/policy/simulateOn.schema';
import { TripRepositoryProviderInterfaceResolver, TerritoryRepositoryProviderInterfaceResolver } from '../interfaces';
import { Policy } from '~/engine/entities/Policy';
import { MetadataStore } from '~/engine/entities/MetadataStore';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    validateDateMiddleware({
      startPath: 'campaign.start_date',
      endPath: 'campaign.end_date',
      minStart: () => new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 31 * 5),
      maxEnd: () => new Date(),
    }),
    ...copyGroupIdAndApplyGroupPermissionMiddlewares(
      { territory: 'territory.policy.simulate.past', registry: 'registry.policy.simulate.past' },
      'campaign',
    ),
  ],
})
export class SimulateOnPastAction extends AbstractAction {
  constructor(
    private tripRepository: TripRepositoryProviderInterfaceResolver,
    private territoryRepository: TerritoryRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    // 1. Find selector and instanciate policy
    const territory_selector = await this.territoryRepository.findSelectorFromId(params.campaign.territory_id);
    const policy = await Policy.import({ ...params.campaign, territory_selector, _id: 1 });

    // 2. Start a cursor to find trips
    const cursor = this.tripRepository.findTripByPolicy(policy, policy.start_date, policy.end_date);
    let done = false;

    let carpool_total = 0;
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
          carpool_total += 1;
          if (finalAmount > 0) {
            carpool_subsidized += 1;
          }
          amount += finalAmount;
        }
      }
    } while (!done);

    // TODO approximation à éviter
    return {
      trip_subsidized: carpool_subsidized,
      trip_excluded: carpool_total / 2 - carpool_subsidized,
      amount,
    };
  }
}
