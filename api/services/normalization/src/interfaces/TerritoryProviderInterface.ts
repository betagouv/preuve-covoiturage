export interface TerritoryProviderInterface {
  findByInsee(insee: string): Promise<number>;
  findByPoint({ lon, lat }: { lon: number; lat: number }): Promise<number>;
}

export abstract class TerritoryProviderInterfaceResolver implements TerritoryProviderInterface {
  async findByInsee(insee: string): Promise<number> {
    throw new Error();
  }
  async findByPoint({ lon, lat }: { lon: number; lat: number }): Promise<number> {
    throw new Error();
  }
}
