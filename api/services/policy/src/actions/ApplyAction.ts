import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/policy/apply.contract';
import { PolicyEngine } from '../engine/PolicyEngine';
import {
  IncentiveRepositoryProviderInterfaceResolver,
  CampaignRepositoryProviderInterfaceResolver,
  TripRepositoryProviderInterfaceResolver,
  IncentiveInterface,
} from '../interfaces';

@handler({ ...handlerConfig, middlewares: [['channel.service.only', ['carpool', handlerConfig.service]]] })
export class ApplyAction extends AbstractAction {
  constructor(
    private tripRepository: TripRepositoryProviderInterfaceResolver,
    private campaignRepository: CampaignRepositoryProviderInterfaceResolver,
    private incentiveRepository: IncentiveRepositoryProviderInterfaceResolver,
    private engine: PolicyEngine,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    // 1. Find trips
    console.log('>>> search trips');
    const trips = await this.tripRepository.findTripsById(params.trips);

    let allIncentives = [];

    console.log('>>> process campaigns for all trips');
    for (const trip of trips) {
      // 2. Find applicable campaign for this trip
      const campaigns = await this.campaignRepository.findApplicableCampaigns(trip.territories, trip.datetime);

      // 3. For each campaign, use policy engine to generate incentive
      for (const campaign of campaigns) {
        const incentives: IncentiveInterface[] = await this.engine.process(trip, campaign);
        allIncentives = [...allIncentives, ...incentives];
      }
    }

    console.log('>>> save incentives');
    await this.incentiveRepository.createMany(allIncentives);
  }
}
