import { KernelInterfaceResolver, provider } from '@ilos/common';
import { handlerConfig } from '../shared/apdf/export.contract';
import {
  ParamsInterface as GetCampaignParamInterface,
  ResultInterface as GetCampaignResultInterface,
  signature as getCampaignSignature,
} from '../shared/policy/find.contract';

@provider()
export class CheckCampaign {
  constructor(private kernel: KernelInterfaceResolver) {}

  async call(campaign_id: number, start_date: Date, end_date: Date): Promise<GetCampaignResultInterface> {
    const getCampaignParamInterface: GetCampaignParamInterface = { _id: Number(campaign_id) };
    const campaign: GetCampaignResultInterface = await this.kernel.call<
      GetCampaignParamInterface,
      GetCampaignResultInterface
    >(getCampaignSignature, getCampaignParamInterface, {
      channel: { service: handlerConfig.service },
      call: { user: { permissions: ['registry.policy.find'] } },
    });

    // checks
    this.isActive(campaign);
    this.isValidDateRange(campaign, start_date, end_date);

    return campaign;
  }

  public isActive(campaign: GetCampaignResultInterface): void {
    if (campaign.status !== 'active') throw new Error(`Campaign ${campaign._id} is inactive`);
  }

  public isValidDateRange(campaign: GetCampaignResultInterface, start: Date, end: Date): void {
    const { start_date: lower, end_date: upper } = campaign;

    /* eslint-disable */
    if (!lower) throw new Error(`Invalid campaign start_date`);
    if (!upper) throw new Error(`Invalid campaign end_date`);
    if (!start) throw new Error(`Invalid range start check`);
    if (!end) throw new Error(`Invalid range end check`);
    if (lower >= upper) throw new Error(`Campaign start (${lower.toISOString()}) cannot be >= campaign end (${upper.toISOString()})`);
    if (start >= end) throw new Error(`Range start (${start.toISOString()}) cannot be >= range end (${end.toISOString()})`);
    if (end < lower) throw new Error(`Range is before campaign start (${lower.toISOString()})`);
    if (start > upper) throw new Error(`Range is after campaign start (${upper.toISOString()})`);
    /* eslint-enable */
  }
}
