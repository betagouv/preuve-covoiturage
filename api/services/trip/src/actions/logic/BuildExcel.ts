import { KernelInterfaceResolver, provider } from '@ilos/common';
import { ParamsInterface as GetCampaignParamInterface, ResultInterface as GetCampaignResultInterface, signature as getCampaignSignature } from '../../shared/policy/find.contract';
import { handlerConfig } from '../../shared/trip/buildExcelExport.contract';
import { ExcelWorkbookHandler } from './ExcelWorkbookHandler';


@provider()
export class BuildExcel {

  constructor(
    private kernel: KernelInterfaceResolver,
    private excelWorkbookHandler: ExcelWorkbookHandler) {
  }
    
  async call(campaign_id: number) {
    const getCampaignParamInterface: GetCampaignParamInterface = { _id: campaign_id  };
    const campaign: GetCampaignResultInterface = await this.kernel.call<GetCampaignParamInterface, GetCampaignResultInterface>(
      getCampaignSignature, 
      getCampaignParamInterface, 
      { channel: {service : handlerConfig.service}, call: {user: { permissions: ['registry.policy.find']}}}
      )
  }

}