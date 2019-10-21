import { TerritoryInterface } from '@pdc/provider-schema';

export interface TerritoryRepositoryProviderInterface {
  find(id: string): Promise<TerritoryInterface>;
  all(): Promise<TerritoryInterface[]>;
  create(data: TerritoryInterface): Promise<TerritoryInterface>;
  delete(_id: string): Promise<void>;
  patch(id: string, patch: { [k: string]: any }): Promise<TerritoryInterface>;
  findByInsee(insee: String): Promise<TerritoryInterface>;
  findByPosition(lon: Number, lat: Number): Promise<TerritoryInterface>;
}

export abstract class TerritoryRepositoryProviderInterfaceResolver implements TerritoryRepositoryProviderInterface {
  async find(id: string): Promise<TerritoryInterface> {
    throw new Error();
  }

  async all(): Promise<TerritoryInterface[]> {
    throw new Error();
  }

  async create(data: TerritoryInterface): Promise<TerritoryInterface> {
    throw new Error();
  }

  async delete(_id: string): Promise<void> {
    throw new Error();
  }

  async patch(id: string, patch: { [k: string]: any }): Promise<TerritoryInterface> {
    throw new Error();
  }

  async findByInsee(insee: String): Promise<TerritoryInterface> {
    throw new Error();
  }

  async findByPosition(lon: Number, lat: Number): Promise<TerritoryInterface> {
    throw new Error();
  }
}
