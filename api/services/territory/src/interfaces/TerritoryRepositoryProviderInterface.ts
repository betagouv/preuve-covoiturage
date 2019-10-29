import { TerritoryInterface } from '../shared/territory/common/interfaces/TerritoryInterface';
import { ParamsInterface as PatchParamsInterface } from '../shared/territory/update.contract';

export interface TerritoryRepositoryProviderInterface {
  find(id: string): Promise<TerritoryInterface>;
  all(): Promise<TerritoryInterface[]>;
  create(data: TerritoryInterface): Promise<TerritoryInterface>;
  delete(_id: string): Promise<void>;
  update(data: PatchParamsInterface): Promise<TerritoryInterface>;
  patch(id: string, patch: { [k: string]: any }): Promise<TerritoryInterface>;
  findByInsee(insee: String): Promise<TerritoryInterface>;
  findByPosition(lon: Number, lat: Number): Promise<TerritoryInterface>;
}

export abstract class TerritoryRepositoryProviderInterfaceResolver implements TerritoryRepositoryProviderInterface {
  async find(id: string): Promise<TerritoryInterface & { _id: string }> {
    throw new Error();
  }

  async all(): Promise<(TerritoryInterface & { _id: string })[]> {
    throw new Error();
  }

  async create(data: TerritoryInterface): Promise<TerritoryInterface & { _id: string }> {
    throw new Error();
  }

  async delete(_id: string): Promise<void> {
    throw new Error();
  }

  async update(data: PatchParamsInterface): Promise<TerritoryInterface & { _id: string }> {
    throw new Error('Method not implemented.');
  }

  async patch(id: string, patch: { [k: string]: any }): Promise<TerritoryInterface & { _id: string }> {
    throw new Error();
  }

  async findByInsee(insee: String): Promise<TerritoryInterface & { _id: string }> {
    throw new Error();
  }

  async findByPosition(lon: Number, lat: Number): Promise<TerritoryInterface & { _id: string }> {
    throw new Error();
  }
}
