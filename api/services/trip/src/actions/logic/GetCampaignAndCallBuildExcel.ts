import { KernelInterfaceResolver, provider, InvalidRequestException } from '@ilos/common';
import { ParamsInterface as GetCampaignParamInterface, ResultInterface as GetCampaignResultInterface, signature as getCampaignSignature } from '../../shared/policy/find.contract';
import { handlerConfig } from '../../shared/trip/buildExcelExport.contract';
import { BuildExcelFileForCampaign } from './BuildExcelFileForCampaign';


@provider()
export class GetCampaignAndCallBuildExcel {

  constructor(
    private kernel: KernelInterfaceResolver,
    private buildExcelFileForCampaign: BuildExcelFileForCampaign) {
  }
    
  async call(campaign_id: number, start_date: Date, end_date: Date): Promise<string> {
    const getCampaignParamInterface: GetCampaignParamInterface = { _id: campaign_id  };
    const campaign: GetCampaignResultInterface = await this.kernel.call<GetCampaignParamInterface, GetCampaignResultInterface>(
        getCampaignSignature, 
        getCampaignParamInterface, 
        { channel: {service : handlerConfig.service}, call: {user: { permissions: ['registry.policy.find']}}}
      )

    if(!this.isCampaignActive(campaign)){
      throw new InvalidRequestException({
        'campaign.status': campaign.status, 
        required_campaign_status: 'active'
      })
    }

    if(!this.isDateRangeInsideCampagnDate(campaign, start_date, end_date)) {
      throw new InvalidRequestException({
        'campaign.start_date': campaign.start_date,
         'campaign.end_date': campaign.end_date, 
         export_start_date: start_date, 
         export_end_date: end_date
      })
    }
    
    return await this.buildExcelFileForCampaign.call(campaign_id);
  }

  private isCampaignActive(campaign): boolean {
    return campaign.status === 'active'
  }

  private isDateRangeInsideCampagnDate(campaign: GetCampaignResultInterface,  start_date: Date, end_date): boolean {
    return campaign.start_date < start_date && campaign.end_date > end_date || campaign.start_date > start_date && campaign.end_date < end_date;
  }

}