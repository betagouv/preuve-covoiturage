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
    [
      'scope.it',
      [
        [],
        [
          (params, context): string => {
            if (
              'campaign' in params &&
              'territory_id' in params.campaign &&
              params.campaign.territory_id === context.call.user.territory_id
            ) {
              return 'incentive-campaign.create';
            }
          },
        ],
      ],
    ],
    'validate.rules',
    ['validate.date', ['campaign', new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 64), new Date()]],
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
    const incentives: IncentiveInterface[] = [];
    do {
      const results = await cursor.next();
      done = results.done;
      if (results.value) {
        for (const trip of results.value) {
          // 3. For each trip, process
          incentives.push(...(await engine.process(campaign, trip)));
        }
      }
      // 4. Save incentives
    } while (!done);

    return incentives.reduce(
      (acc, i) => {
        if (i.amount > 0) {
          acc.amount += i.amount;
          acc.trip_subsidized += 1;
        } else {
          acc.trip_excluded += 1;
        }
        return acc;
      },
      {
        trip_subsidized: 0,
        trip_excluded: 0,
        amount: 0,
      },
    );
  }
}
