import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { Infer } from "@/lib/superstruct/index.ts";
import { Direction } from "@/pdc/providers/superstruct/shared/index.ts";
import { IncentiveByMonth } from "@/pdc/services/dashboard/dto/IncentiveByMonth.ts";
import { IncentiveRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/IncentiveRepositoryProviderInterface.ts";
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
  method: "incentiveByMonth",
  middlewares: [
    ["validate", IncentiveByMonth],
  ],
})
export class IncentiveByMonthAction extends AbstractAction {
  constructor(private repository: IncentiveRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: IncentiveByMonth): Promise<ResultInterface> {
    return this.repository.getIncentiveByMonth(params);
  }
}
