import type { ResultInterface as IncentiveResultInterface } from "@/pdc/services/observatory/actions/incentive/IncentiveAction.ts";
import type { Incentive as IncentiveParamsInterface } from "@/pdc/services/observatory/dto/Incentive.ts";

export type { IncentiveParamsInterface, IncentiveResultInterface };

export interface IncentiveRepositoryInterface {
  getIncentive(
    params: IncentiveParamsInterface,
  ): Promise<IncentiveResultInterface>;
}

export abstract class IncentiveRepositoryInterfaceResolver implements IncentiveRepositoryInterface {
  async getIncentive(
    params: IncentiveParamsInterface,
  ): Promise<IncentiveResultInterface> {
    throw new Error();
  }
}
