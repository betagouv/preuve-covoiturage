import { TerritoryInterface } from '../shared/territory/common/interfaces/TerritoryInterface';
import { TerritoryDbInterface } from '../shared/territory/common/interfaces/TerritoryDbInterface';
import { ParamsInterface as PatchParamsInterface } from '../shared/territory/update.contract';

export interface TerritoryRepositoryProviderInterface {
  find(id: number): Promise<TerritoryDbInterface>;
  all(): Promise<TerritoryDbInterface[]>;
  create(data: TerritoryInterface): Promise<TerritoryDbInterface>;
  delete(_id: number): Promise<void>;
  update(data: PatchParamsInterface): Promise<TerritoryDbInterface>;
  patch(id: number, patch: { [k: string]: any }): Promise<TerritoryDbInterface>;
  findByInsee(insee: String): Promise<TerritoryDbInterface>;
  findByPosition(lon: Number, lat: Number): Promise<TerritoryDbInterface>;
}

export abstract class TerritoryRepositoryProviderInterfaceResolver implements TerritoryRepositoryProviderInterface {
  async find(id: number): Promise<TerritoryDbInterface> {
    throw new Error();
  }

  async all(): Promise<TerritoryDbInterface[]> {
    throw new Error();
  }

  async create(data: TerritoryInterface): Promise<TerritoryDbInterface> {
    throw new Error();
  }

  async delete(_id: number): Promise<void> {
    throw new Error();
  }

  async update(data: PatchParamsInterface): Promise<TerritoryDbInterface> {
    throw new Error('Method not implemented.');
  }

  async patch(id: number, patch: { [k: string]: any }): Promise<TerritoryDbInterface> {
    throw new Error();
  }

  async findByInsee(insee: String): Promise<TerritoryDbInterface> {
    throw new Error();
  }

  async findByPosition(lon: Number, lat: Number): Promise<TerritoryDbInterface> {
    throw new Error();
  }
}
