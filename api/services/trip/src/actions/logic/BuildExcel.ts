import { KernelInterfaceResolver, provider } from '@ilos/common';
import { ParamsInterface as GetCampaignParamInterface, ResultInterface as GetCampaignResultInterface, signature as getCampaignSignature } from '../../shared/policy/find.contract';
import { handlerConfig } from '../../shared/trip/buildExcelExport.contract';
import { BuildExcelFileForCampaign } from './BuildExcelFileForCampaign';


@provider()
export class BuildExcel {

  constructor(
    private kernel: KernelInterfaceResolver,
    private buildExcelFileForCampaign: BuildExcelFileForCampaign) {
  }
    
  async call(campaign_id: number, start_date: Date, end_date: Date) {
    const getCampaignParamInterface: GetCampaignParamInterface = { _id: campaign_id  };
    const campaign: GetCampaignResultInterface = await this.kernel.call<GetCampaignParamInterface, GetCampaignResultInterface>(
        getCampaignSignature, 
        getCampaignParamInterface, 
        { channel: {service : handlerConfig.service}, call: {user: { permissions: ['registry.policy.find']}}}
      )
    // TODO Check campaign is effective for that date range
    
    //

    this.buildExcelFileForCampaign.call(campaign_id);
  }

}