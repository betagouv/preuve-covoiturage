import { provider } from '@ilos/common';

import {
  CampaignInterface,
  IncentiveInterface,
  TripInterface,
} from '../interfaces';
import {
  MetadataProviderInterfaceResolver,
} from './interfaces';

import { ProcessableCampaign } from './ProcessableCampaign';

@provider()
export class PolicyEngine {
  constructor(protected metaRepository: MetadataProviderInterfaceResolver) {}

  public async processStateless(pc: ProcessableCampaign, trip: TripInterface): Promise<IncentiveInterface[]> {
    const results: IncentiveInterface[] = [];
    for (const person of trip.people) {
      const ctx = { trip, person, result: undefined, stack: [] };
      results.push(await pc.apply(ctx));
    }

    return results;
  }

  public async processStateful(pc: ProcessableCampaign, incentive: IncentiveInterface): Promise<IncentiveInterface> {
    const keys = pc.getMetaKeys(incentive);
    const meta = await this.metaRepository.get(pc.policy_id, keys);
    const result = pc.applyStateful(incentive, meta);
    await this.metaRepository.set(pc.policy_id, meta);
    return result;
  }

  public async process(trip: TripInterface, campaign: CampaignInterface): Promise<IncentiveInterface[]> {
    if (!this.guard(trip, campaign)) {
      return [];
    }

    const pc = new ProcessableCampaign(campaign);
    const stageTwoIncentives = [];
    const stageOneIncentives = await this.processStateless(pc, trip);
    for (const incentive of stageOneIncentives) {
      stageTwoIncentives.push(
        await this.processStateful(pc, incentive),
      );
    }
    return stageTwoIncentives;
  }

  protected guard(trip: TripInterface, campaign: CampaignInterface) {
    if (
      trip.territories.indexOf(campaign.territory_id) < 0 ||
      trip.datetime > campaign.end_date ||
      trip.datetime < campaign.start_date
    ) {
      return false;
    }
    return true;
  }
}
