import { InvalidRequestException, KernelInterfaceResolver, provider } from '@ilos/common';
import {
  ParamsInterface as GetCampaignParamInterface,
  ResultInterface as GetCampaignResultInterface,
  signature as getCampaignSignature,
} from '../../shared/policy/find.contract';
import { handlerConfig } from '../../shared/trip/excelExport.contract';

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
    if (!this.isCampaignActive(campaign)) {
      throw new InvalidRequestException(`Campaign ${campaign._id} is not active`);
    }

    if (!this.isDateRangeInsideCampagnDate(campaign, start_date, end_date)) {
      throw new InvalidRequestException(`Provided date range are not inside campaign ${campaign._id} periode`);
    }

    return campaign;
  }

  private isCampaignActive(campaign): boolean {
    return campaign.status === 'active';
  }

  private isDateRangeInsideCampagnDate(campaign: GetCampaignResultInterface, start_date: Date, end_date): boolean {
    return (
      (campaign.start_date > start_date && campaign.start_date < end_date) ||
      (campaign.end_date < end_date && campaign.end_date > start_date) ||
      (campaign.start_date < start_date && campaign.end_date > end_date)
    );
  }
}
