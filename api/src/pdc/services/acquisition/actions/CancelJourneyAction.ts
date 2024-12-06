import { ContextType, handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from "@/pdc/providers/middleware/index.ts";

import { CarpoolAcquisitionService } from "@/pdc/providers/carpool/index.ts";
import { CancelJourney } from "@/pdc/services/acquisition/dto/CancelJourney.ts";

@handler({
  service: "acquisition",
  method: "cancel",
  middlewares: [
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      operator: "operator.acquisition.cancel",
    }),
    ["validate", CancelJourney],
  ],
})
export class CancelJourneyAction extends AbstractAction {
  constructor(
    private acquisitionService: CarpoolAcquisitionService,
  ) {
    super();
  }

  protected async handle(params: CancelJourney, context: ContextType): Promise<void> {
    const { operator_id, operator_journey_id } = params;
    await this.acquisitionService.cancelRequest({
      api_version: context.call?.api_version_range || "3",
      operator_id,
      operator_journey_id,
      cancel_code: params.code,
      cancel_message: params.message || "",
    });
  }
}
