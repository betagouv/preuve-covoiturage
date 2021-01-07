import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/simulateOnPast.contract';

import { alias } from '../shared/policy/simulateOn.schema';
import { PolicyEngine } from '../engine/PolicyEngine';
import { TripRepositoryProviderInterfaceResolver, IncentiveInterface } from '../interfaces';
import { InMemoryMetadataProvider } from '../engine/faker/InMemoryMetadataProvider';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    'validate.rules',
    ['validate.date', ['campaign', () => [new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 31 * 4), new Date()]]],
  ],
})
export class SimulateOnPastAction extends AbstractAction {
  constructor(private tripRepository: TripRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    // 1. Find campaign and start engine
    const engine = new PolicyEngine(new InMemoryMetadataProvider());
    const campaign = engine.buildCampaign(params.campaign);

    // 2. Start a cursor to find trips
    const cursor = await this.tripRepository.findTripByPolicy(campaign);
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
