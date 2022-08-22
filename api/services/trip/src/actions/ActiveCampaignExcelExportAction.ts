import { ContextType, handler, InitHookInterface, KernelInterfaceResolver } from '@ilos/common';
import { Action } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';
import {
  ParamsInterface as ListCampaignsParamInterface,
  ResultInterface as ListCampaignsResultInterface,
  signature as listCampaignsSignature,
} from '../shared/policy/list.contract';
import { handlerConfig, ResultInterface, signature } from '../shared/trip/activeCampaignExcelExport.contract';
import {
  ParamsInterface as BuildExcelExportParamInterface,
  ResultInterface as BuildExcelExportResultInterface,
  signature as buildExcelExportSignature,
} from '../shared/capitalcall/export.contract';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service)],
})
export class ActiveCampaignExcelExportAction extends Action implements InitHookInterface {
  constructor(private kernel: KernelInterfaceResolver) {
    super();
  }

  async init(): Promise<void> {
    await this.kernel.notify<{}>(
      signature,
      {},
      {
        call: {
          user: {},
        },
        channel: {
          service: handlerConfig.service,
          metadata: {
            repeat: {
              cron: '0 5 8 * *',
            },
            jobId: 'trip.active_campaign_excel_export',
          },
        },
      },
    );
  }

  public async handle(params: {}, context: ContextType): Promise<ResultInterface> {
    const activeCampaigns: ListCampaignsResultInterface = await this.findActiveCampaigns();
    return this.buildExcelsForCampaigns(activeCampaigns);
  }

  private async buildExcelsForCampaigns(activeCampaigns: ListCampaignsResultInterface) {
    const campaign_ids: number[] = activeCampaigns.map((c) => c._id);
    console.info(`Trying excel export for active campaign ids ${campaign_ids}`);
    const buildExcelExportParams: BuildExcelExportParamInterface = {
      format: { tz: 'Europe/Paris' },
      query: { campaign_id: campaign_ids },
    };

    await this.kernel.call<BuildExcelExportParamInterface, BuildExcelExportResultInterface>(
      buildExcelExportSignature,
      buildExcelExportParams,
      {
        channel: { service: handlerConfig.service },
        call: { user: { permissions: ['registry.capitalcall.export'] } },
      },
    );
  }

  private async findActiveCampaigns() {
    const listCampaignParams: ListCampaignsParamInterface = { status: 'active' };
    const activeCampaigns: ListCampaignsResultInterface = await this.kernel.call<
      ListCampaignsParamInterface,
      ListCampaignsResultInterface
    >(listCampaignsSignature, listCampaignParams, {
      channel: { service: handlerConfig.service },
      call: { user: { permissions: ['common.policy.list'] } },
    });
    return activeCampaigns;
  }
}
