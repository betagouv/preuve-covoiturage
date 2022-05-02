import {
  TerritoryCodeInterface,
  TerritorySelectorsInterface,
} from '../shared/territory/common/interfaces/TerritoryCodeInterface';
export interface TerritoryRepositoryProviderInterface {
  findByPoint({ lon, lat }: { lon: number; lat: number }): Promise<TerritoryCodeInterface>;
  findSiretById(_id: number | number[]): Promise<{ _id: number; siret: string }[]>;
  findBySelector(data: Partial<TerritoryCodeInterface>): Promise<number[]>;
  findSelectorFromId(id: number): Promise<TerritorySelectorsInterface>;
}
export abstract class TerritoryRepositoryProviderInterfaceResolver implements TerritoryRepositoryProviderInterface {
  async findByPoint({ lon, lat }: { lon: number; lat: number }): Promise<TerritoryCodeInterface> {
    throw new Error();
  }
  async findSiretById(_id: number | number[]): Promise<{ _id: number; siret: string }[]> {
    throw new Error();
  }
  async findBySelector(data: Partial<TerritoryCodeInterface>): Promise<number[]> {
    throw new Error();
  }
  async findSelectorFromId(id: number): Promise<TerritorySelectorsInterface> {
    throw new Error();
  }
}
