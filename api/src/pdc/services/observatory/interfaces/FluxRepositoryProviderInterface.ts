import type {
  ParamsInterface as MonthlyFluxParamsInterface,
  ResultInterface as MonthlyFluxResultInterface,
} from "@/shared/observatory/flux/monthlyFlux.contract.ts";

// eslint-disable-next-line max-len
import type { ResultInterface as lastRecordMonthlyFluxResultInterface } from "@/shared/observatory/flux/lastRecordMonthlyFlux.contract.ts";

import type {
  ParamsInterface as EvolMonthlyFluxParamsInterface,
  ResultInterface as EvolMonthlyFluxResultInterface,
} from "@/shared/observatory/flux/evolMonthlyFlux.contract.ts";

import type {
  ParamsInterface as BestMonthlyFluxParamsInterface,
  ResultInterface as BestMonthlyFluxResultInterface,
} from "@/shared/observatory/flux/bestMonthlyFlux.contract.ts";

import type {
  ParamsInterface as DeleteMonthlyFluxParamsInterface,
  ParamsInterface as InsertMonthlyFluxParamsInterface,
} from "@/shared/observatory/flux/insertMonthlyFlux.contract.ts";

export type {
  BestMonthlyFluxParamsInterface,
  BestMonthlyFluxResultInterface,
  DeleteMonthlyFluxParamsInterface,
  EvolMonthlyFluxParamsInterface,
  EvolMonthlyFluxResultInterface,
  InsertMonthlyFluxParamsInterface,
  lastRecordMonthlyFluxResultInterface,
  MonthlyFluxParamsInterface,
  MonthlyFluxResultInterface,
};

export interface FluxRepositoryInterface {
  insertOneMonthFlux(params: InsertMonthlyFluxParamsInterface): Promise<void>;
  deleteOneMonthFlux(params: DeleteMonthlyFluxParamsInterface): Promise<void>;
  getMonthlyFlux(
    params: MonthlyFluxParamsInterface,
  ): Promise<MonthlyFluxResultInterface>;
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
  async insertOneMonthFlux(
    params: InsertMonthlyFluxParamsInterface,
  ): Promise<void> {
    throw new Error();
  }

  async deleteOneMonthFlux(
    params: DeleteMonthlyFluxParamsInterface,
  ): Promise<void> {
    throw new Error();
  }

  async refreshAllFlux(): Promise<void> {
    throw new Error();
  }

  async getMonthlyFlux(
    params: MonthlyFluxParamsInterface,
  ): Promise<MonthlyFluxResultInterface> {
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
