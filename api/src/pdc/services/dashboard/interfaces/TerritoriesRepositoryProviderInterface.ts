import type { ResultInterface as TerritoriesResultInterface } from "@/pdc/services/dashboard/actions/TerritoriesAction.ts";
import { Territories as TerritoriesParamsInterface } from "@/pdc/services/dashboard/dto/Territories.ts";

export type { TerritoriesParamsInterface, TerritoriesResultInterface };

export interface TerritoriesRepositoryInterface {
  getTerritories(params: TerritoriesParamsInterface): Promise<TerritoriesResultInterface>;
}

export abstract class TerritoriesRepositoryInterfaceResolver implements TerritoriesRepositoryInterface {
  async getTerritories(params: TerritoriesParamsInterface): Promise<TerritoriesResultInterface> {
    throw new Error();
  }
}
