import { ContextType, handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { CarpoolAcquisitionService } from "@/pdc/providers/carpool/index.ts";
import { OperatorClass } from "@/pdc/providers/carpool/interfaces/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";

import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/shared/acquisition/patch.contract.ts";

import { alias } from "@/shared/acquisition/patch.schema.ts";

import { env_or_false } from "@/lib/env/index.ts";
import { get } from "@/lib/object/index.ts";
import { AcquisitionStatusEnum } from "../interfaces/AcquisitionRepositoryProviderInterface.ts";
import { AcquisitionRepositoryProvider } from "../providers/AcquisitionRepositoryProvider.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    ["validate", alias],
    hasPermissionMiddleware("operator.acquisition.create"),
  ],
})
export class PatchJourneyAction extends AbstractAction {
  constructor(
    private repository: AcquisitionRepositoryProvider,
    private acquisitionService: CarpoolAcquisitionService,
  ) {
    super();
  }

  protected async handle(
    params: ParamsInterface,
    context: ContextType,
  ): Promise<ResultInterface> {
    const operator_id = get(context, "call.user.operator_id");
    await this.repository.patchPayload(
      {
        operator_id,
        operator_journey_id: params.operator_journey_id,
        status: [AcquisitionStatusEnum.Pending, AcquisitionStatusEnum.Error],
      },
      params,
    );
    if (env_or_false("APP_ENABLE_CARPOOL_V2")) {
      const toUpdate = {
        ...params,
        ...(params.operator_class
          ? { operator_class: OperatorClass[params.operator_class] }
          : {}),
      };

      await this.acquisitionService.updateRequest({
        ...toUpdate,
        api_version: 3,
        operator_id,
        operator_journey_id: params.operator_journey_id,
      });
    }
  }
}
