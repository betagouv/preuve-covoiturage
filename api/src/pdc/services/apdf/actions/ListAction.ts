import {
  ConfigInterfaceResolver,
  ContextType,
  handler,
  KernelInterfaceResolver,
  NotFoundException,
} from "@/ilos/common/index.ts";
import { Action } from "@/ilos/core/index.ts";
import { logger } from "@/lib/logger/index.ts";
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from "@/pdc/providers/middleware/index.ts";
import {
  ParamsInterface as CampaignFindParams,
  ResultInterface as CampaignFindResult,
} from "../../policy/contracts/find.contract.ts";
import { ListApdf } from "../dto/ListApdf.ts";
import { StorageRepositoryProviderInterfaceResolver } from "../interfaces/StorageRepositoryProviderInterface.ts";

export type EnrichedApdfType = {
  signed_url: string;
  key: string;
  size: number;
  operator_id: number;
  campaign_id: number;
  datetime: Date;
  name: string;
};

export type ResultsInterface = EnrichedApdfType[];

@handler({
  service: "apdf",
  method: "list",
  middlewares: [
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      territory: "territory.apdf.list",
      operator: "operator.apdf.list",
      registry: "registry.apdf.list",
    }),
    ["validate", ListApdf],
  ],
})
export class ListAction extends Action {
  constructor(
    private kernel: KernelInterfaceResolver,
    private storageRepository: StorageRepositoryProviderInterfaceResolver,
    private config: ConfigInterfaceResolver,
  ) {
    super();
  }

  public async handle(
    params: ListApdf,
    context: ContextType,
  ): Promise<ResultsInterface> {
    const { campaign_id, operator_id } = params;

    // fetch the policy by id
    let campaign: CampaignFindResult | null = null;
    try {
      campaign = await this.kernel.call<CampaignFindParams, CampaignFindResult>(
        "campaign:find",
        { _id: campaign_id },
        { channel: { service: "apdf" }, call: context.call },
      );
    } catch (e) {
      logger.error(`[apdf:list -> campaign:find] ${e.message}`);
      throw e;
    }

    if (!campaign) {
      throw new NotFoundException(`Could not find campaign ${campaign_id}`);
    }

    // curry operators and campaign filters
    // find policies, enrich and filter by operator
    const opsFilter = this.storageRepository.operatorsFilter(
      operator_id ? [operator_id] : [],
    );
    const cmpFilter = this.storageRepository.campaignsFilter([campaign_id]);

    // month filter. We can hide the current month to operators and territories
    // by setting the env var APP_APDF_SHOW_LAST_MONTH to 'false'
    // default: true
    const monthFilter = this.storageRepository.showCurrentMonthFilter(
      context.call!.user.permissions,
      this.config.get("apdf.showLastMonth"),
    );

    return (await this.storageRepository.enrich(
      await this.storageRepository.findByCampaign(campaign),
    ))
      .filter(cmpFilter)
      .filter(opsFilter)
      .filter(monthFilter);
  }
}
