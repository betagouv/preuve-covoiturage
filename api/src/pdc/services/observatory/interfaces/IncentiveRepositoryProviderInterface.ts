import type {
  ParamsInterface as IncentiveParamsInterface,
  ResultInterface as IncentiveResultInterface,
} from "../contracts/incentive/getIncentive.contract.ts";

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
