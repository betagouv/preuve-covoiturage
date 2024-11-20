import { ContextType, handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { get, omit } from "@/lib/object/index.ts";
import { CarpoolAcquisitionService } from "@/pdc/providers/carpool/index.ts";
import { OperatorClass, PatchRequest } from "@/pdc/providers/carpool/interfaces/index.ts";
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from "@/pdc/providers/middleware/helpers.ts";
import { PatchJourney } from "@/pdc/services/acquisition/dto/PatchJourney.ts";
import { Position } from "@/pdc/services/geo/contracts/GeoJson.ts";

@handler({
  service: "acquisition",
  method: "patch",
  middlewares: [
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      operator: "operator.acquisition.create",
    }),
    ["validate", PatchJourney],
  ],
})
export class PatchJourneyAction extends AbstractAction {
  constructor(
    private acquisitionService: CarpoolAcquisitionService,
  ) {
    super();
  }

  protected async handle(params: PatchJourney, context: ContextType): Promise<void> {
    const request = this.convertPayloadToRequest(context, params);
    await this.acquisitionService.patchCarpool(request);
  }

  protected convertPayloadToRequest(context: ContextType, params: PatchJourney): PatchRequest {
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

  protected wrapDatetime(params: PatchJourney, type: "start" | "end"): { [key: string]: Date | Position } {
    if (!params[type]) {
      throw new Error(`Missing '${type}' parameter`);
    }

    const { datetime, lat, lon } = params[type];

    return {
      [`${type}_datetime`]: datetime,
      [`${type}_position`]: { lat, lon },
    };
  }

  protected wrapApiVersion(context: ContextType): { api_version: string } {
    return { api_version: get(context, "call.api_version_range", "3") as string };
  }

  protected wrapOperatorId(context: ContextType): { operator_id: number } {
    const operator_id = get(context, "call.user.operator_id");
    if (!operator_id) {
      throw new Error("Missing 'operator_id' in context");
    }

    return { operator_id: operator_id as number };
  }

  protected wrapOperatorClass(params: PatchJourney): { operator_class?: OperatorClass } {
    const operator_class = params.operator_class ? OperatorClass[params.operator_class] : undefined;
    if (operator_class === undefined) {
      throw new Error("Invalid 'operator_class' parameter");
    }

    return operator_class ? { operator_class } : {};
  }

  protected wrapOperatorTripId(params: PatchJourney): { operator_trip_id?: string } {
    return params.operator_trip_id ? { operator_trip_id: params.operator_trip_id } : {};
  }
}
