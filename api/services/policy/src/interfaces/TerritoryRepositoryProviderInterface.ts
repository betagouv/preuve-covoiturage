export interface TerritoryRepositoryProviderInterface {
  findByPoint({ lon, lat }: { lon: number; lat: number }): Promise<number[]>;
  findSiretById(_id: number | number[]): Promise<{ _id: number; siret: string }[]>;
}
export abstract class TerritoryRepositoryProviderInterfaceResolver implements TerritoryRepositoryProviderInterface {
  async findByPoint({ lon, lat }: { lon: number; lat: number }): Promise<number[]> {
    throw new Error();
  }
  async findSiretById(_id: number | number[]): Promise<{ _id: number; siret: string }[]> {
    throw new Error();
  }
}
