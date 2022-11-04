import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/provider-middleware';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/simulateOnPastGeo.contract';

import { MetadataStore } from '../engine/entities/MetadataStore';
import { TripRepositoryProviderInterfaceResolver } from '../interfaces';
import { alias } from '../shared/policy/simulateOn.schema';
import { Policy } from '../engine/entities/Policy';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares(
      { territory: 'territory.policy.simulate.past', registry: 'registry.policy.simulate.past' },
      'policy',
    ),
  ],
})
export class SimulateOnPastAction extends AbstractAction {
  constructor(private tripRepository: TripRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    /// REWORK NEEDED
    // 1. Build template policy
    const policy = await Policy.import({ ...params.policy, territory_selector, _id: 1 });

    const end_date: Date = new Date();
    const start_date: Date = new Date();
    start_date.setMonth(start_date.getMonth() - 6);

    const cursor = this.tripRepository.findTripByGeo(params.territory_insee, start_date, end_date);
    /// REWORK NEEDED
    // 2. Start a cursor to find trips
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
