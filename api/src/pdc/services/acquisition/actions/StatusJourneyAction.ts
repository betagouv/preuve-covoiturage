import { ContextType, handler, NotFoundException } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from "@/pdc/providers/middleware/index.ts";

import { semver } from "@/deps.ts";
import { castToStatusEnum } from "@/pdc/providers/carpool/helpers/castStatus.ts";
import { CarpoolStatusService } from "@/pdc/providers/carpool/providers/CarpoolStatusService.ts";
import { handlerConfig, ParamsInterface, ResultInterface } from "../contracts/status.contract.ts";
import { alias } from "../contracts/status.schema.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    ["validate", alias],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      operator: "operator.acquisition.status",
    }),
  ],
})
export class StatusJourneyAction extends AbstractAction {
  constructor(
    private statusService: CarpoolStatusService,
  ) {
    super();
  }

  protected async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const { operator_journey_id, operator_id } = params;
    const result = await this.statusService.findByOperatorJourneyId(
      operator_id,
      operator_journey_id,
      context.call?.api_version_range || "3.1",
    );
    if (!result) {
      throw new NotFoundException();
    }

    const status = castToStatusEnum(result.status) as any;
    return {
      operator_journey_id,
      status,
      created_at: result.created_at,
      fraud_error_labels: result.fraud.map((f) =>
        (!!f.label && f.label == "interoperator_overlap_trip") ? "interoperator_overlap" : f.label
      ),
      anomaly_error_details: result.anomaly as any,
      terms_violation_details: result.terms.map((f) => f.label),
      ...(semver.rangeIntersects(
          semver.parseRange(">=3.2"),
          semver.parseRange(context.call?.api_version_range || "3.0"),
        )
        ? { journey_id: result.legacy_id }
        : {}),
    };
  }
}
