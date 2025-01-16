import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { Infer } from "@/lib/superstruct/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/middlewares.ts";
import { Direction } from "@/pdc/providers/superstruct/shared/index.ts";
import { IncentiveByDay } from "@/pdc/services/dashboard/dto/IncentiveByDay.ts";
import { IncentiveRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/IncentiveRepositoryProviderInterface.ts";
export type ResultInterface = {
  date: Date;
  territory_id: number;
  direction: Infer<typeof Direction>;
  journeys: number;
  incented_journeys: number;
  incentive_amount: number;
}[];

@handler({
  service: "dashboard",
  method: "incentiveByDay",
  middlewares: [
    ["validate", IncentiveByDay],
    hasPermissionMiddleware("common.observatory.stats"),
  ],
})
export class IncentiveByDayAction extends AbstractAction {
  constructor(private repository: IncentiveRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: IncentiveByDay): Promise<ResultInterface> {
    return this.repository.getIncentiveByDay(params);
  }
}
