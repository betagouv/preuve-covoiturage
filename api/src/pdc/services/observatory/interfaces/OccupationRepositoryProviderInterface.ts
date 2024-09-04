import type {
  ParamsInterface as MonthlyOccupationParamsInterface,
  ResultInterface as MonthlyOccupationResultInterface,
} from "@/shared/observatory/occupation/monthlyOccupation.contract.ts";
import type {
  ParamsInterface as EvolMonthlyOccupationParamsInterface,
  ResultInterface as EvolMonthlyOccupationResultInterface,
} from "@/shared/observatory/occupation/evolMonthlyOccupation.contract.ts";

import type {
  ParamsInterface as BestMonthlyTerritoriesParamsInterface,
  ResultInterface as BestMonthlyTerritoriesResultInterface,
} from "@/shared/observatory/occupation/bestMonthlyTerritories.contract.ts";
import type {
  ParamsInterface as DeleteMonthlyOccupationParamsInterface,
  ParamsInterface as InsertMonthlyOccupationParamsInterface,
} from "@/shared/observatory/occupation/insertMonthlyOccupation.contract.ts";

export type {
  BestMonthlyTerritoriesParamsInterface,
  BestMonthlyTerritoriesResultInterface,
  DeleteMonthlyOccupationParamsInterface,
  EvolMonthlyOccupationParamsInterface,
  EvolMonthlyOccupationResultInterface,
  InsertMonthlyOccupationParamsInterface,
  MonthlyOccupationParamsInterface,
  MonthlyOccupationResultInterface,
};

export interface OccupationRepositoryInterface {
  insertOneMonthOccupation(
    params: InsertMonthlyOccupationParamsInterface,
  ): Promise<void>;
  deleteOneMonthOccupation(
    params: DeleteMonthlyOccupationParamsInterface,
  ): Promise<void>;
  getMonthlyOccupation(
    params: MonthlyOccupationParamsInterface,
  ): Promise<MonthlyOccupationResultInterface>;
  getEvolMonthlyOccupation(
    params: EvolMonthlyOccupationParamsInterface,
  ): Promise<EvolMonthlyOccupationResultInterface>;
  getBestMonthlyTerritories(
    params: BestMonthlyTerritoriesParamsInterface,
  ): Promise<BestMonthlyTerritoriesResultInterface>;
}

export abstract class OccupationRepositoryInterfaceResolver
  implements OccupationRepositoryInterface {
  async insertOneMonthOccupation(
    params: InsertMonthlyOccupationParamsInterface,
  ): Promise<void> {
    throw new Error();
  }

  async deleteOneMonthOccupation(
    params: DeleteMonthlyOccupationParamsInterface,
  ): Promise<void> {
    throw new Error();
  }

  async refreshAllOccupation(): Promise<void> {
    throw new Error();
  }

  async getMonthlyOccupation(
    params: MonthlyOccupationParamsInterface,
  ): Promise<MonthlyOccupationResultInterface> {
    throw new Error();
  }

  async getEvolMonthlyOccupation(
    params: EvolMonthlyOccupationParamsInterface,
  ): Promise<EvolMonthlyOccupationResultInterface> {
    throw new Error();
  }

  async getBestMonthlyTerritories(
    params: BestMonthlyTerritoriesParamsInterface,
  ): Promise<BestMonthlyTerritoriesResultInterface> {
    throw new Error();
  }
}
