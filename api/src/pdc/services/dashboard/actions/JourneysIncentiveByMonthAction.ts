import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { Infer } from "@/lib/superstruct/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/middlewares.ts";
import { Direction } from "@/pdc/providers/superstruct/shared/index.ts";
import { JourneysByMonth } from "@/pdc/services/dashboard/dto/Journeys.ts";
import { JourneysRepositoryInterfaceResolver } from "../interfaces/JourneysRepositoryInterface.ts";
export type ResultInterface = {
  year: number;
  month: number;
  territory_id: string;
  direction: Infer<typeof Direction>;
  journeys: number;
  incented_journeys: number;
  incentive_amount: number;
}[];

@handler({
  service: "dashboard",
  method: "journeysIncentiveByMonth",
  middlewares: [
    ["validate", JourneysByMonth],
    hasPermissionMiddleware("common.observatory.stats"),
  ],
  apiRoute: {
    path: "/dashboard/incentive/month",
    action: "dashboard:journeysIncentiveByMonth",
    method: "GET",
  },
})
export class JourneysIncentiveByMonthAction extends AbstractAction {
  constructor(private repository: JourneysRepositoryInterfaceResolver) {
    super();
  }

  public override async handle(params: JourneysByMonth): Promise<ResultInterface> {
    return this.repository.getIncentiveByMonth(params);
  }
}
