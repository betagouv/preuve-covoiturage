import { TerritoryBaseInterface } from '../shared/territory/common/interfaces/TerritoryInterface';
import { TerritoryDbMetaInterface } from '../shared/territory/common/interfaces/TerritoryDbMetaInterface';
import { ParamsInterface as PatchParamsInterface } from '../shared/territory/update.contract';

export interface TerritoryRepositoryProviderInterface {
  find(id: number): Promise<TerritoryDbMetaInterface>;
  all(): Promise<TerritoryDbMetaInterface[]>;
  create(data: TerritoryBaseInterface): Promise<TerritoryDbMetaInterface>;
  delete(_id: number): Promise<void>;
  update(data: PatchParamsInterface): Promise<TerritoryDbMetaInterface>;
  patch(id: number, patch: { [k: string]: any }): Promise<TerritoryDbMetaInterface>;
  findByInsee(insee: string): Promise<TerritoryDbMetaInterface>;
  findByPosition(lon: number, lat: number): Promise<TerritoryDbMetaInterface>;
}

export abstract class TerritoryRepositoryProviderInterfaceResolver implements TerritoryRepositoryProviderInterface {
  async find(id: number): Promise<TerritoryDbMetaInterface> {
    throw new Error();
  }

  async all(): Promise<TerritoryDbMetaInterface[]> {
    throw new Error();
  }

  async create(data: TerritoryBaseInterface): Promise<TerritoryDbMetaInterface> {
    throw new Error();
  }

  async delete(_id: number): Promise<void> {
    throw new Error();
  }

  async update(data: PatchParamsInterface): Promise<TerritoryDbMetaInterface> {
    throw new Error();
  }

  async patch(id: number, patch: { [k: string]: any }): Promise<TerritoryDbMetaInterface> {
    throw new Error();
  }

  async findByInsee(insee: string): Promise<TerritoryDbMetaInterface> {
    throw new Error();
  }

  async findByPosition(lon: number, lat: number): Promise<TerritoryDbMetaInterface> {
    throw new Error();
  }
}
