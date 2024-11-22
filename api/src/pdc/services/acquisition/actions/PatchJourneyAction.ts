import { ContextType, handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { get, omit } from "@/lib/object/index.ts";
import { CarpoolAcquisitionService } from "@/pdc/providers/carpool/index.ts";
import { OperatorClass, PatchRequest, Position } from "@/pdc/providers/carpool/interfaces/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";
import { handlerConfig, ParamsInterface, ResultInterface } from "../contracts/patch.contract.ts";
import { alias } from "../contracts/patch.schema.ts";

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

  protected async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const request = this.convertPayloadToRequest(context, params);
    await this.acquisitionService.patchCarpool(request);
  }

  protected convertPayloadToRequest(context: ContextType, params: ParamsInterface): PatchRequest {
    return {
      ...omit(params, ["start", "end"]),
      ...this.wrapDatetime(params, "start"),
      ...this.wrapDatetime(params, "end"),
      ...this.wrapOperatorClass(params),
      ...this.wrapApiVersion(context),
      ...this.wrapOperatorId(context),
      ...this.wrapOperatorTripId(params),
    };
  }

  protected wrapDatetime(params: ParamsInterface, type: "start" | "end"): { [key: string]: Date | Position } {
    return {
      [`${type}_datetime`]: params[type].datetime,
      [`${type}_position`]: { lat: params[type].lat, lon: params[type].lon },
    };
  }

  protected wrapApiVersion(context: ContextType): { api_version: string } {
    return { api_version: get(context, "call.api_version_range", "3") as string };
  }

  protected wrapOperatorId(context: ContextType): { operator_id: number } {
    return { operator_id: get(context, "call.user.operator_id") as number };
  }

  protected wrapOperatorClass(params: ParamsInterface): { operator_class?: OperatorClass } {
    return params.operator_class && OperatorClass[params.operator_class]
      ? { operator_class: OperatorClass[params.operator_class] }
      : {};
  }

  protected wrapOperatorTripId(params: ParamsInterface): { operator_trip_id?: string } {
    return params.operator_trip_id ? { operator_trip_id: params.operator_trip_id } : {};
  }
}
