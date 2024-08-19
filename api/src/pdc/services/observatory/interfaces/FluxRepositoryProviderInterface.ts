// eslint-disable-next-line max-len
import type { ResultInterface as lastRecordMonthlyFluxResultInterface } from "@/shared/observatory/flux/lastRecordMonthlyFlux.contract.ts";

import type {
  ParamsInterface as GetFluxParamsInterface,
  ResultInterface as GetFluxResultInterface,
} from "@/shared/observatory/flux/getFlux.contract.ts";

import type {
  ParamsInterface as EvolMonthlyFluxParamsInterface,
  ResultInterface as EvolMonthlyFluxResultInterface,
} from "@/shared/observatory/flux/evolMonthlyFlux.contract.ts";

import type {
  ParamsInterface as BestMonthlyFluxParamsInterface,
  ResultInterface as BestMonthlyFluxResultInterface,
} from "@/shared/observatory/flux/bestMonthlyFlux.contract.ts";

export type {
  BestMonthlyFluxParamsInterface,
  BestMonthlyFluxResultInterface,
  EvolMonthlyFluxParamsInterface,
  EvolMonthlyFluxResultInterface,
  GetFluxParamsInterface,
  GetFluxResultInterface,
  lastRecordMonthlyFluxResultInterface,
};

export interface FluxRepositoryInterface {
  getFlux(
    params: GetFluxParamsInterface,
  ): Promise<GetFluxResultInterface>;
  lastRecordMonthlyFlux(): Promise<lastRecordMonthlyFluxResultInterface>;
  getEvolMonthlyFlux(
    params: EvolMonthlyFluxParamsInterface,
  ): Promise<EvolMonthlyFluxResultInterface>;
  getBestMonthlyFlux(
    params: BestMonthlyFluxParamsInterface,
  ): Promise<BestMonthlyFluxResultInterface>;
}

export abstract class FluxRepositoryInterfaceResolver
  implements FluxRepositoryInterface {
  async getFlux(
    params: GetFluxParamsInterface,
  ): Promise<GetFluxResultInterface> {
    throw new Error();
  }

  async lastRecordMonthlyFlux(): Promise<lastRecordMonthlyFluxResultInterface> {
    throw new Error();
  }

  async getEvolMonthlyFlux(
    params: EvolMonthlyFluxParamsInterface,
  ): Promise<EvolMonthlyFluxResultInterface> {
    throw new Error();
  }

  async getBestMonthlyFlux(
    params: BestMonthlyFluxParamsInterface,
  ): Promise<BestMonthlyFluxResultInterface> {
    throw new Error();
  }
}
