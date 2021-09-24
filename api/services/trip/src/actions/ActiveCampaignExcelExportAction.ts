import {
  ConfigInterfaceResolver,
  ContextType,
  handler,
  InitHookInterface,
  KernelInterfaceResolver,
} from '@ilos/common';
import { Action } from '@ilos/core';
import {
  ParamsInterface as ListCampaignsParamInterface,
  ResultInterface as ListCampaignsResultInterface,
  signature as listCampaignsSignature,
} from '../shared/policy/list.contract';
import {
  ParamsInterface as BuildExcelExportParamInterface,
  ResultInterface as BuildExcelExportResultInterface,
  signature as buildExcelExportSignature,
} from '../shared/trip/excelExport.contract';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware/dist';
import { handlerConfig, ResultInterface, signature } from '../shared/trip/activeCampaignExcelExport.contract';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service)],
})
export class ActiveCampaignExcelExportAction extends Action implements InitHookInterface {
  constructor(private config: ConfigInterfaceResolver, private kernel: KernelInterfaceResolver) {
    super();
  }

  async init(): Promise<void> {
    /**
     * Activate fund call exports in production only
     */
    if (this.config.get('app.environment') === 'production') {
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
                cron: '0 5 6 * *',
              },
              jobId: 'trip.active_campaign_excel_export',
            },
          },
        },
      );
    }
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
        call: { user: { permissions: ['registry.trip.excelExport'] } },
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
