import { provider } from '@ilos/common';
import { TerritorySelectorsInterface } from '../shared/territory/common/interfaces/TerritoryCodeInterface';
import {
  CampaignInterface,
  IncentiveInterface,
  IncentiveStatusEnum,
  MetadataRepositoryProviderInterfaceResolver,
  TripInterface,
} from '../interfaces';
import { MetadataWrapper } from '../providers/MetadataWrapper';
import { isSelected } from './helpers/isSelected';
import { ProcessableCampaign } from './ProcessableCampaign';
import { TripIncentives } from './TripIncentives';

@provider()
export class PolicyEngine {
  constructor(protected metaRepository: MetadataRepositoryProviderInterfaceResolver) {}

  public buildCampaign(campaign: CampaignInterface, selectors: TerritorySelectorsInterface = {}): ProcessableCampaign {
    return new ProcessableCampaign(campaign, selectors);
  }

  public async processStateless(pc: ProcessableCampaign, trip: TripInterface): Promise<IncentiveInterface[]> {
    if (!this.guard(pc, trip)) {
      return [];
    }
    const tripIncentives = TripIncentives.createFromTrip(trip);
    for (const person of tripIncentives.getProcessablePeople()) {
      const meta = new MetadataWrapper();
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
    meta.extraRegister(pc.getMetaExtra(incentive));
    const result = pc.applyStateful(incentive, meta);
    await this.metaRepository.set(pc.policy_id, meta, incentive.datetime);
    return result;
  }

  public async process(pc: ProcessableCampaign, trip: TripInterface): Promise<IncentiveInterface[]> {
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

  protected guard(campaign: ProcessableCampaign, couples: TripInterface): boolean {
    if (couples.datetime < campaign.start_date) {
      return false;
    }

    if (couples.datetime > campaign.end_date) {
      return false;
    }

    if (!campaign.territory_selector || Object.keys(campaign.territory_selector).length <= 0) {
      return true;
    }

    for (const starts of couples.map((t) => t.start)) {
      if (isSelected(starts, campaign.territory_selector)) {
        return true;
      }
    }

    for (const starts of couples.map((t) => t.end)) {
      if (isSelected(starts, campaign.territory_selector)) {
        return true;
      }
    }
    return true;
  }
}
