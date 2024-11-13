import type {
  ParamsInterface as EvolOccupationParamsInterface,
  ResultInterface as EvolOccupationResultInterface,
} from "../contracts/occupation/getEvolOccupation.contract.ts";
import type {
  ParamsInterface as OccupationParamsInterface,
  ResultInterface as OccupationResultInterface,
} from "../contracts/occupation/getOccupation.contract.ts";

import type {
  ParamsInterface as BestTerritoriesParamsInterface,
  ResultInterface as BestTerritoriesResultInterface,
} from "../contracts/occupation/getBestTerritories.contract.ts";

export type {
  BestTerritoriesParamsInterface,
  BestTerritoriesResultInterface,
  EvolOccupationParamsInterface,
  EvolOccupationResultInterface,
  OccupationParamsInterface,
  OccupationResultInterface,
};

export interface OccupationRepositoryInterface {
  getOccupation(
    params: OccupationParamsInterface,
  ): Promise<OccupationResultInterface>;
  getEvolOccupation(
    params: EvolOccupationParamsInterface,
  ): Promise<EvolOccupationResultInterface>;
  getBestTerritories(
    params: BestTerritoriesParamsInterface,
  ): Promise<BestTerritoriesResultInterface>;
}

export abstract class OccupationRepositoryInterfaceResolver implements OccupationRepositoryInterface {
  async getOccupation(
    params: OccupationParamsInterface,
  ): Promise<OccupationResultInterface> {
    throw new Error();
  }

  async getEvolOccupation(
    params: EvolOccupationParamsInterface,
  ): Promise<EvolOccupationResultInterface> {
    throw new Error();
  }

  async getBestTerritories(
    params: BestTerritoriesParamsInterface,
  ): Promise<BestTerritoriesResultInterface> {
    throw new Error();
  }
}
