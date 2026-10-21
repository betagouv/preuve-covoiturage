import { ContextType, handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/middlewares.ts";
import { CampaignConditionId } from "@/pdc/services/dashboard/dto/CampaignConditions.ts";
import { CampaignConditionsRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/CampaignConditionsRepositoryInterface.ts";

@handler({
  service: "dashboard",
  method: "validateCampaignCondition",
  middlewares: [
    ["validate", CampaignConditionId],
    hasPermissionMiddleware("registry.campaign_condition.validate"),
  ],
  apiRoute: {
    path: "/dashboard/campaign-condition/validate",
    action: "dashboard:validateCampaignCondition",
    method: "POST",
  },
})
export class ValidateCampaignConditionAction extends AbstractAction {
  constructor(private repository: CampaignConditionsRepositoryInterfaceResolver) {
    super();
  }

  public override async handle(params: CampaignConditionId, context: ContextType): Promise<{ success: boolean }> {
    await this.repository.validate(params.id, context?.call?.user?._id ?? null);
    return { success: true };
  }
}
