import { ContextType, handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { CarpoolAcquisitionService } from "@/pdc/providers/carpool/index.ts";
import { OperatorClass } from "@/pdc/providers/carpool/interfaces/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";

import { handlerConfig, ParamsInterface, ResultInterface } from "../contracts/patch.contract.ts";
import { alias } from "../contracts/patch.schema.ts";

import { get } from "@/lib/object/index.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    ["validate", alias],
    hasPermissionMiddleware("operator.acquisition.create"),
  ],
})
export class PatchJourneyAction extends AbstractAction {
  constructor(
    private acquisitionService: CarpoolAcquisitionService,
  ) {
    super();
  }

  protected async handle(
    params: ParamsInterface,
    context: ContextType,
  ): Promise<ResultInterface> {
    const operator_id = get(context, "call.user.operator_id") as number;
    const operator_class: OperatorClass | undefined = params.operator_class && OperatorClass[params.operator_class]
      ? OperatorClass[params.operator_class]
      : undefined;

    const toUpdate = {
      ...params,
      ...(operator_class ? { operator_class } : {}),
    };

    await this.acquisitionService.updateRequest({
      ...toUpdate,
      api_version: context.call?.api_version_range || "3",
      operator_id,
      operator_journey_id: params.operator_journey_id,
    });
  }
}
