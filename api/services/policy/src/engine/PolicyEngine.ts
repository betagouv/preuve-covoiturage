import { provider } from '@ilos/common';
import {
  CampaignInterface,
  IncentiveInterface,
  IncentiveStatusEnum,
  MetadataRepositoryProviderInterfaceResolver,
  TripInterface,
} from '../interfaces';
import { MetadataWrapper } from '../providers/MetadataWrapper';
import { ProcessableCampaign } from './ProcessableCampaign';
import { TripIncentives } from './TripIncentives';

@provider()
export class PolicyEngine {
  constructor(protected metaRepository: MetadataRepositoryProviderInterfaceResolver) {}

  public buildCampaign(campaign: CampaignInterface): ProcessableCampaign {
    return new ProcessableCampaign(campaign);
  }

  public async processStateless(pc: ProcessableCampaign, trip: TripInterface): Promise<IncentiveInterface[]> {
    const tripIncentives = TripIncentives.createFromTrip(trip);
    const meta = new MetadataWrapper();
    for (const person of tripIncentives.getProcessablePeople()) {
      const ctx = { trip, person, result: undefined, stack: [] };
      const incentive = pc.apply(ctx, meta);
      tripIncentives.addIncentive(incentive);
    }
    return tripIncentives.getIncentives();
  }

  public async processStateful(
    pc: ProcessableCampaign,
    incentive: IncentiveInterface,
  ): Promise<{ carpool_id: number; policy_id: number; amount: number; status: IncentiveStatusEnum }> {
    const keys = pc.getMetaKeys(incentive);
    const meta = await this.metaRepository.get(pc.policy_id, keys, incentive.datetime);
    const result = pc.applyStateful(incentive, meta);
    await this.metaRepository.set(pc.policy_id, meta, incentive.datetime);
    return result;
  }

  public async process(pc: ProcessableCampaign, trip: TripInterface): Promise<IncentiveInterface[]> {
    if (!this.guard(pc, trip)) {
      return [];
    }

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

  protected guard(campaign: ProcessableCampaign, trip: TripInterface): boolean {
    if (
      trip
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
