import { provider } from '@ilos/common';

import { CampaignInterface, IncentiveInterface, TripInterface } from '../interfaces';
import { MetadataProviderInterfaceResolver } from './interfaces';

import { ProcessableCampaign } from './ProcessableCampaign';

@provider()
export class PolicyEngine {
  constructor(protected metaRepository: MetadataProviderInterfaceResolver) {}

  public buildCampaign(campaign: CampaignInterface): ProcessableCampaign {
    return new ProcessableCampaign(campaign);
  }

  public async processStateless(pc: ProcessableCampaign, trip: TripInterface): Promise<IncentiveInterface[]> {
    const results: IncentiveInterface[] = [];
    for (const person of trip.people) {
      const ctx = { trip, person, result: undefined, stack: [] };
      results.push(await pc.apply(ctx));
    }

    return results;
  }

  public async processStateful(
    pc: ProcessableCampaign,
    incentive: IncentiveInterface,
  ): Promise<{ carpool_id: number; policy_id: number; amount: number }> {
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
    const incentives = await this.processStateless(pc, trip);
    for (const [i, incentive] of incentives.entries()) {
      const { amount } = await this.processStateful(pc, incentive);
      incentives[i] = {
        ...incentive,
        amount,
      };
    }

    return incentives;
  }

  protected guard(trip: TripInterface, campaign: CampaignInterface) {
    if (
      trip.people
        .map((p) => [...p.start_territory_id, ...p.end_territory_id])
        .reduce((s, t) => {
          t.map((v) => s.add(v));
          return s;
        }, new Set())
        .has(campaign.territory_id) &&
      trip.datetime >= campaign.start_date &&
      trip.datetime <= campaign.end_date
    ) {
      return true;
    }
    return false;
  }
}
