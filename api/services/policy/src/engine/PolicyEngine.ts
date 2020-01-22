import { provider } from '@ilos/common';

import {
  CampaignInterface,
  CampaignMetadataRepositoryProviderInterfaceResolver,
  IncentiveInterface,
  TripInterface,
} from '../interfaces';
import { ProcessableCampaign } from './ProcessableCampaign';

@provider()
export class PolicyEngine {
  constructor(protected metaRepository: CampaignMetadataRepositoryProviderInterfaceResolver) {}

  public async process(trip: TripInterface, campaign: CampaignInterface): Promise<IncentiveInterface[]> {
    const results: IncentiveInterface[] = [];
    if (
      trip.territories.indexOf(campaign.territory_id) < 0 ||
      trip.datetime > campaign.end_date ||
      trip.datetime < campaign.start_date
    ) {
      return results;
    }

    const pc = new ProcessableCampaign(campaign.global_rules, campaign.rules);

    // get metadata wrapper
    const meta = await this.metaRepository.get(campaign._id);

    for (const person of trip.people) {
      const ctx = { trip, person, meta, result: undefined, stack: [] };
      await pc.apply(ctx);
      results.push({
        policy_id: campaign._id,
        carpool_id: person.carpool_id,
        identity_uuid: person.identity_uuid,
        amount: Math.round(ctx.result),
        // status
        // detail:
      });
    }

    await this.metaRepository.set(meta);
    return results;
  }
}
