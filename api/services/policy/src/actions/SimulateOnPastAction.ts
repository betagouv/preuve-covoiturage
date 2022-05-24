import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyGroupIdAndApplyGroupPermissionMiddlewares, validateDateMiddleware } from '@pdc/provider-middleware';

import { validateRuleParametersMiddleware } from '../middlewares/ValidateRuleParametersMiddleware';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/simulateOnPast.contract';

import { alias } from '../shared/policy/simulateOn.schema';
import { PolicyEngine } from '../engine/PolicyEngine';
import { InMemoryMetadataProvider } from '../engine/faker/InMemoryMetadataProvider';
import {
  TripRepositoryProviderInterfaceResolver,
  IncentiveInterface,
  TerritoryRepositoryProviderInterfaceResolver,
} from '../interfaces';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    validateRuleParametersMiddleware(),
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
    // 1. Find campaign and start engine
    const engine = new PolicyEngine(new InMemoryMetadataProvider());
    const selectors = await this.territoryRepository.findSelectorFromId(params.campaign.territory_id);
    const campaign = engine.buildCampaign(params.campaign, selectors);

    // 2. Start a cursor to find trips
    const cursor = await this.tripRepository.findTripByPolicy(campaign, campaign.start_date, campaign.end_date);
    let done = false;

    let trip_subsidized = 0;
    let trip_excluded = 0;
    let amount = 0;

    do {
      const results = await cursor.next();
      done = results.done;
      if (results.value) {
        for (const trip of results.value) {
          // 3. For each trip, process
          const incentives: IncentiveInterface[] = await engine.process(campaign, trip);

          // The number of passenger determines number of couples
          const trip_nb = trip.filter((t) => !t.is_driver).length;
          if (
            trip
              .filter((t) => t.is_driver)
              .reduce((acc, ti) => acc + incentives.find((inc) => inc.carpool_id === ti.carpool_id).amount, 0) > 0
          ) {
            // If one driver is subsidized then all couple are (cause of engine business logic)
            trip_subsidized += trip_nb;
          } else {
            const current_trip_subsidized = trip.filter(
              (t) => !t.is_driver && incentives.find((inc) => inc.carpool_id === t.carpool_id).amount > 0,
            ).length;
            // Else we look the number of subsidized passengers
            trip_subsidized += current_trip_subsidized;
            trip_excluded += trip_nb - current_trip_subsidized;
          }
          // Amount sum all
          amount += incentives.reduce((acc, i) => acc + i.amount, 0);
        }
      }
    } while (!done);

    return {
      trip_subsidized,
      trip_excluded,
      amount,
    };
  }
}
