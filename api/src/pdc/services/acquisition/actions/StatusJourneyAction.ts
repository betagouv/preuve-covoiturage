import { ContextType, handler, NotFoundException } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from "@/pdc/providers/middleware/index.ts";

import { Infer } from "@/lib/superstruct/index.ts";
import { castToStatusEnum } from "@/pdc/providers/carpool/helpers/castStatus.ts";
import { CarpoolStatusService } from "@/pdc/providers/carpool/providers/CarpoolStatusService.ts";
import { JourneyStatus } from "@/pdc/services/acquisition/dto/shared.ts";
import { StatusJourney } from "@/pdc/services/acquisition/dto/StatusJourney.ts";

interface AnomalyErrorDetails {
  label: "temporal_overlap_anomaly";
  metas: {
    conflicting_journey_id: string;
    temporal_overlap_duration_ratio: number;
  };
}
interface ResultInterface {
  operator_journey_id: string;
  status: Infer<typeof JourneyStatus>;
  created_at: Date;
  fraud_error_labels?: string[];
  anomaly_error_details?: AnomalyErrorDetails[];
  terms_violation_details?: string[];
}

@handler({
  service: "acquisition",
  method: "status",
  middlewares: [
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      operator: "operator.acquisition.status",
    }),
    ["validate", StatusJourney],
  ],
})
export class StatusJourneyAction extends AbstractAction {
  constructor(
    private statusService: CarpoolStatusService,
  ) {
    super();
  }

  protected async handle(params: StatusJourney, context: ContextType): Promise<ResultInterface> {
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
      fraud_error_labels: result.fraud.map((f) => f.label),
      anomaly_error_details: result.anomaly as any,
      terms_violation_details: result.terms.map((f) => f.label),
    };
  }
}
