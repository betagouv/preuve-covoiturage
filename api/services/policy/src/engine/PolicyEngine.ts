import { provider } from '@ilos/common';

import {
  CampaignInterface,
  IncentiveInterface,
  TripInterface,
  IncentiveStateEnum,
  IncentiveStatusEnum,
} from '../interfaces';
import { MetadataProviderInterfaceResolver } from './interfaces';

import { ProcessableCampaign } from './ProcessableCampaign';

@provider()
export class PolicyEngine {
  constructor(protected metaRepository: MetadataProviderInterfaceResolver) {}

  public buildCampaign(campaign: CampaignInterface): ProcessableCampaign {
    return new ProcessableCampaign(campaign);
  }

  public async processStateless(pc: ProcessableCampaign, trip: TripInterface): Promise<IncentiveInterface[]> {
    const drivers = trip
      .filter((p) => p.is_driver)
      .sort((p1, p2) => (p1.carpool_id < p2.carpool_id ? -1 : p1.carpool_id > p2.carpool_id ? 1 : 0));
    const passengers = trip.filter((p) => !p.is_driver);
    const people = [...passengers, drivers.shift()].filter((p) => p !== undefined);

    // Empty incitation for duplicate drivers
    const results: IncentiveInterface[] = drivers.map((p) => ({
      carpool_id: p.carpool_id,
      policy_id: pc.policy_id,
      datetime: p.datetime,
      result: 0,
      amount: 0,
      state: IncentiveStateEnum.Null,
      status: IncentiveStatusEnum.Draft,
      meta: {},
    }));

    for (const person of people) {
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
