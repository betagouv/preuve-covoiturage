import { ContextType, handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from "@/pdc/providers/middleware/index.ts";

import { CarpoolAcquisitionService } from "@/pdc/providers/carpool/index.ts";
import { handlerConfig, ParamsInterface, ResultInterface } from "@/shared/acquisition/cancel.contract.ts";
import { alias } from "@/shared/acquisition/cancel.schema.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    ["validate", alias],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      operator: "operator.acquisition.cancel",
    }),
  ],
})
export class CancelJourneyAction extends AbstractAction {
  constructor(
    private acquisitionService: CarpoolAcquisitionService,
  ) {
    super();
  }

  protected async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const { operator_id, operator_journey_id } = params;
    await this.acquisitionService.cancelRequest({
      api_version: context.channel.api_version || 0,
      operator_id,
      operator_journey_id,
      cancel_code: params.code,
      cancel_message: params.message,
    });
  }
}
