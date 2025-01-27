import type { ResultInterface as BestTerritoriesResultInterface } from "@/pdc/services/observatory/actions/occupation/BestTerritoriesAction.ts";
import type { ResultInterface as EvolOccupationResultInterface } from "@/pdc/services/observatory/actions/occupation/EvolOccupationAction.ts";
import type { ResultInterface as OccupationResultInterface } from "@/pdc/services/observatory/actions/occupation/OccupationAction.ts";
import type { BestTerritories as BestTerritoriesParamsInterface } from "@/pdc/services/observatory/dto/occupation/BestTerritories.ts";
import type { EvolOccupation as EvolOccupationParamsInterface } from "@/pdc/services/observatory/dto/occupation/EvolOccupation.ts";
import type { Occupation as OccupationParamsInterface } from "@/pdc/services/observatory/dto/occupation/Occupation.ts";
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
