import type {
  ParamsInterface as TerritoriesListParamsInterface,
  ResultInterface as TerritoriesListResultInterface,
} from '@shared/observatory/territories/list.contract.ts';
import type {
  ParamsInterface as TerritoryNameParamsInterface,
  ResultInterface as TerritoryNameResultInterface,
} from '@shared/observatory/territories/name.contract.ts';

export type {
  TerritoriesListParamsInterface,
  TerritoriesListResultInterface,
  TerritoryNameParamsInterface,
  TerritoryNameResultInterface,
};

export interface TerritoriesRepositoryInterface {
  getTerritoriesList(params: TerritoriesListParamsInterface): Promise<TerritoriesListResultInterface>;
  getTerritoryName(params: TerritoryNameParamsInterface): Promise<TerritoryNameResultInterface>;
}

export abstract class TerritoriesRepositoryInterfaceResolver implements TerritoriesRepositoryInterface {
  async getTerritoriesList(params: TerritoriesListParamsInterface): Promise<TerritoriesListResultInterface> {
    throw new Error();
  }

  async getTerritoryName(params: TerritoryNameParamsInterface): Promise<TerritoryNameResultInterface> {
    throw new Error();
  }
}
