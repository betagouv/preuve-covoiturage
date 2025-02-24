import { handler, InvalidParamsException } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from "@/pdc/providers/middleware/index.ts";

import { castUserStringToUTC, subDaysTz, today } from "@/pdc/helpers/dates.helper.ts";
import { castFromStatusEnum } from "@/pdc/providers/carpool/helpers/castStatus.ts";
import { CarpoolStatusService } from "@/pdc/providers/carpool/providers/CarpoolStatusService.ts";
import { isAfter, isBefore } from "dep:date-fns";
import { handlerConfig, ParamsInterface, ResultInterface } from "../contracts/list.contract.ts";
import { alias } from "../contracts/list.schema.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    ["validate", alias],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      operator: "operator.acquisition.status",
    }),
  ],
})
export class ListJourneyAction extends AbstractAction {
  constructor(private status: CarpoolStatusService) {
    super();
  }

  protected async handle(params: ParamsInterface): Promise<ResultInterface> {
    const acquisitions = await this.status.findBy(
      this.applyDefault(params),
    );
    return acquisitions;
  }

  protected applyDefault(params: ParamsInterface) {
    const { operator_id, start, end, status, offset, limit } = params;
    const todayDate = today();
    const endDate = castUserStringToUTC(end) || todayDate;
    const startDate = castUserStringToUTC(start) || subDaysTz(todayDate, 7);
    this.validateStartEnd(startDate, endDate, todayDate);

    return {
      operator_id,
      status: castFromStatusEnum(status as any),
      start: startDate,
      end: endDate,
      offset: offset || 0,
      limit: limit || 50,
    };
  }

  protected validateStartEnd(startDate: Date, endDate: Date, todayDate: Date) {
    if (isAfter(startDate, endDate)) {
      throw new InvalidParamsException("Start should be before end");
    }
    if (isAfter(endDate, todayDate)) {
      throw new InvalidParamsException("End should be before now");
    }
    const maxStartDate = subDaysTz(todayDate, 90);
    if (isBefore(startDate, maxStartDate)) {
      throw new InvalidParamsException(
        `Start should be after ${maxStartDate.toISOString()}`,
      );
    }
  }
}
