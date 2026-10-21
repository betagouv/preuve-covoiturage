import { ContextType, ForbiddenException, handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from "@/pdc/providers/middleware/index.ts";
import { CampaignConditions } from "@/pdc/services/dashboard/dto/CampaignConditions.ts";
import { Caller, callerOf, withContactFor } from "@/pdc/services/dashboard/helpers/campaignConditionAccess.ts";
import {
  CampaignConditionRow,
  CampaignConditionsRepositoryInterfaceResolver,
} from "@/pdc/services/dashboard/interfaces/CampaignConditionsRepositoryInterface.ts";

@handler({
  service: "dashboard",
  method: "campaignConditions",
  middlewares: [
    ["validate", CampaignConditions],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      registry: "registry.campaign_condition.list",
      operator: "operator.campaign_condition.list",
      territory: "territory.campaign_condition.list",
    }),
  ],
  apiRoute: {
    path: "/dashboard/campaign-conditions",
    action: "dashboard:campaignConditions",
    method: "GET",
  },
})
export class CampaignConditionsAction extends AbstractAction {
  constructor(private repository: CampaignConditionsRepositoryInterfaceResolver) {
    super();
  }

  // Un opérateur voit les campagnes où il est listé ; un territoire, celles qu'il a saisies ou qui le concernent.
  public override async handle(params: CampaignConditions, context: ContextType): Promise<CampaignConditionRow[]> {
    const rows = await this.rowsFor(params, callerOf(context, "registry.campaign_condition.list"));
    // registry.user lit tout mais, comme les non-auteurs, ne reçoit pas l'email de contact
    const writer = callerOf(context);
    return rows.map((row) => withContactFor(row, writer));
  }

  private async rowsFor(params: CampaignConditions, caller: Caller): Promise<CampaignConditionRow[]> {
    if (caller.registry) return this.repository.list({ id: params.id });
    if (caller.territory_id !== null) {
      const resolved = await this.repository.resolveTerritory(caller.territory_id);
      return this.repository.list({ id: params.id, territory: { id: caller.territory_id, resolved } });
    }
    if (caller.operator_id === null) throw new ForbiddenException("Invalid permissions");
    return this.repository.list({ id: params.id, operator_id: caller.operator_id });
  }
}
