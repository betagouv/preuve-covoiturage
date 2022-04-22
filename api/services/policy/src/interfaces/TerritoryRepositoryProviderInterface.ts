import { TerritoryCodesInterface } from '../../../../../shared/territory/common/interfaces/TerritoryCodeInterface';
export interface TerritoryRepositoryProviderInterface {
  findByPoint({ lon, lat }: { lon: number; lat: number }): Promise<TerritoryCodesInterface>;
  findSiretById(_id: number | number[]): Promise<{ _id: number; siret: string }[]>;
  findBySelector(data: Partial<TerritoryCodesInterface>): Promise<number[]>;
}
export abstract class TerritoryRepositoryProviderInterfaceResolver implements TerritoryRepositoryProviderInterface {
  async findByPoint({ lon, lat }: { lon: number; lat: number }): Promise<TerritoryCodesInterface> {
    throw new Error();
  }
  async findSiretById(_id: number | number[]): Promise<{ _id: number; siret: string }[]> {
    throw new Error();
  }
  async findBySelector(data: Partial<TerritoryCodesInterface>): Promise<number[]> {
    throw new Error();
  }
}
