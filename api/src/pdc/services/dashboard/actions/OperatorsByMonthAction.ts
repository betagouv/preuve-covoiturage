import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { Infer } from "@/lib/superstruct/index.ts";
import { Direction } from "@/pdc/providers/superstruct/shared/index.ts";
import { OperatorsByMonth } from "@/pdc/services/dashboard/dto/OperatorsByMonth.ts";
import { OperatorsRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/OperatorsRepositoryProviderInterface.ts";
export type ResultInterface = {
  year: number;
  month: number;
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
  method: "operatorsByMonth",
  middlewares: [
    ["validate", OperatorsByMonth],
  ],
})
export class OperatorsByMonthAction extends AbstractAction {
  constructor(private repository: OperatorsRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: OperatorsByMonth): Promise<ResultInterface> {
    return this.repository.getOperatorsByMonth(params);
  }
}
