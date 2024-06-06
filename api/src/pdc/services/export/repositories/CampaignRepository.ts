import { KernelInterfaceResolver, provider } from '/ilos/common/index.ts';
import { Campaign } from '../models/Campaign.ts';
import { signature as campaignListSignature } from '/shared/policy/list.contract.ts';

export interface CampaignRepositoryInterface {
  list(): Promise<Map<number, Campaign>>;
}

export abstract class CampaignRepositoryInterfaceResolver implements CampaignRepositoryInterface {
  public async list(): Promise<Map<number, Campaign>> {
    throw new Error('Not implemented');
  }
}

@provider({
  identifier: CampaignRepositoryInterfaceResolver,
})
export class CampaignRepository implements CampaignRepositoryInterface {
  constructor(protected kernel: KernelInterfaceResolver) {}

  // list all campaigns
  public async list(): Promise<Map<number, Campaign>> {
    const campaigns = await this.kernel.call(
      campaignListSignature,
      {},
      { channel: { service: 'export' }, call: { user: { permissions: ['common.policy.list'] } } },
    );

    return campaigns.reduce((acc, c) => {
      acc.set(c._id, new Campaign(c));
      return acc;
    }, new Map());
  }
}
