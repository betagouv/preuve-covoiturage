import { KernelInterfaceResolver, provider, InvalidRequestException } from '@ilos/common';
import {
  ParamsInterface as GetCampaignParamInterface,
  ResultInterface as GetCampaignResultInterface,
  signature as getCampaignSignature,
} from '../../shared/policy/find.contract';
import { handlerConfig } from '../../shared/trip/buildExcelExport.contract';
import { BuildExcelFileForCampaign } from './BuildExcelFileForCampaign';

@provider()
export class GetCampaignAndCallBuildExcel {
  constructor(private kernel: KernelInterfaceResolver, private buildExcelFileForCampaign: BuildExcelFileForCampaign) {}

  async call(campaign_id: number, start_date?: Date, end_date?: Date): Promise<string> {
    if (!start_date && !end_date) {
      start_date = this.startOfPreviousMonthDate();
      end_date = this.endOfPreviousMonthDate();
    }

    const getCampaignParamInterface: GetCampaignParamInterface = { _id: Number(campaign_id) };
    const campaign: GetCampaignResultInterface = await this.kernel.call<
      GetCampaignParamInterface,
      GetCampaignResultInterface
    >(getCampaignSignature, getCampaignParamInterface, {
      channel: { service: handlerConfig.service },
      call: { user: { permissions: ['registry.policy.find'] } },
    });
    if (!this.isCampaignActive(campaign)) {
      throw new InvalidRequestException('Campaign is not active');
    }

    if (!this.isDateRangeInsideCampagnDate(campaign, start_date, end_date)) {
      throw new InvalidRequestException('Provided date range are not inside campagne periode');
    }
    return await this.buildExcelFileForCampaign.call(campaign_id, start_date, end_date);
  }

  private endOfPreviousMonthDate(): Date {
    const endOfMonth: Date = new Date();
    return new Date(endOfMonth.getFullYear(), endOfMonth.getMonth() + 1, 0);
  }

  private startOfPreviousMonthDate(): Date {
    const startOfMonth: Date = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setMonth(startOfMonth.getMonth() - 1);
    return startOfMonth;
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
