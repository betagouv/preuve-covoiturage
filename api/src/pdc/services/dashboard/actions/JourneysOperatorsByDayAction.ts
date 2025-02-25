import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { Infer } from "@/lib/superstruct/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/middlewares.ts";
import { Direction } from "@/pdc/providers/superstruct/shared/index.ts";
import { JourneysByDay } from "@/pdc/services/dashboard/dto/Journeys.ts";
import { JourneysRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/JourneysRepositoryInterface.ts";
export type ResultInterface = {
  date: Date;
  territory_id: string;
  direction: Infer<typeof Direction>;
  operator_id: number;
  operator_name: string;
  journeys: number;
  incented_journeys: number;
  incentive_amount: number;
}[];

@handler({
  service: "dashboard",
  method: "journeysOperatorsByDay",
  middlewares: [
    ["validate", JourneysByDay],
    hasPermissionMiddleware("common.observatory.stats"),
  ],
  apiRoute: {
    path: "/dashboard/operators/day",
    action: "dashboard:journeysOperatorsByDay",
    method: "GET",
  },
})
export class JourneysOperatorsByDayAction extends AbstractAction {
  constructor(private repository: JourneysRepositoryInterfaceResolver) {
    super();
  }

  public override async handle(params: JourneysByDay): Promise<ResultInterface> {
    return this.repository.getOperatorsByDay(params);
  }
}
