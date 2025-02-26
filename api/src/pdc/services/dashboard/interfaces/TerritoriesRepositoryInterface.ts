import type { ResultInterface as CreateTerritoryResultInterface } from "@/pdc/services/dashboard/actions/territories/CreateTerritoryAction.ts";
import type { ResultInterface as DeleteTerritoryResultInterface } from "@/pdc/services/dashboard/actions/territories/DeleteTerritoryAction.ts";
import type { ResultInterface as TerritoriesResultInterface } from "@/pdc/services/dashboard/actions/territories/TerritoriesAction.ts";
import type { ResultInterface as UpdateTerritoryResultInterface } from "@/pdc/services/dashboard/actions/territories/UpdateTerritoryAction.ts";
import {
  CreateTerritory as CreateTerritoryDataInterface,
  DeleteTerritory as DeleteTerritoryParamsInterface,
  Territories as TerritoriesParamsInterface,
  UpdateTerritory as UpdateTerritoryDataInterface,
} from "@/pdc/services/dashboard/dto/Territories.ts";

export type {
  CreateTerritoryDataInterface,
  CreateTerritoryResultInterface,
  DeleteTerritoryParamsInterface,
  DeleteTerritoryResultInterface,
  TerritoriesParamsInterface,
  TerritoriesResultInterface,
  UpdateTerritoryDataInterface,
  UpdateTerritoryResultInterface,
};

export interface TerritoriesRepositoryInterface {
  getTerritories(params: TerritoriesParamsInterface): Promise<TerritoriesResultInterface>;
  deleteTerritory(params: DeleteTerritoryParamsInterface): Promise<DeleteTerritoryResultInterface>;
  updateTerritory(params: UpdateTerritoryDataInterface): Promise<UpdateTerritoryResultInterface>;
  createTerritory(params: CreateTerritoryDataInterface): Promise<CreateTerritoryResultInterface>;
}

export abstract class TerritoriesRepositoryInterfaceResolver implements TerritoriesRepositoryInterface {
  async getTerritories(params: TerritoriesParamsInterface): Promise<TerritoriesResultInterface> {
    throw new Error();
  }
  async deleteTerritory(params: DeleteTerritoryParamsInterface): Promise<DeleteTerritoryResultInterface> {
    throw new Error();
  }
  async updateTerritory(params: UpdateTerritoryDataInterface): Promise<UpdateTerritoryResultInterface> {
    throw new Error();
  }
  async createTerritory(params: CreateTerritoryDataInterface): Promise<CreateTerritoryResultInterface> {
    throw new Error();
  }
}
