import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { Infer } from "@/lib/superstruct/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/middlewares.ts";
import { Direction } from "@/pdc/providers/superstruct/shared/index.ts";
import { OperatorsByDay } from "@/pdc/services/dashboard/dto/OperatorsByDay.ts";
import { OperatorsRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/OperatorsRepositoryInterface.ts";
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
  method: "operatorsByDay",
  middlewares: [
    ["validate", OperatorsByDay],
    hasPermissionMiddleware("common.observatory.stats"),
  ],
  apiRoute: {
    path: "/dashboard/operators/day",
    action: "dashboard:operatorsByDay",
    method: "GET",
  },
})
export class OperatorsByDayAction extends AbstractAction {
  constructor(private repository: OperatorsRepositoryInterfaceResolver) {
    super();
  }

  public override async handle(params: OperatorsByDay): Promise<ResultInterface> {
    return this.repository.getOperatorsByDay(params);
  }
}
