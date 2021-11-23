import { TerritoryDbMetaInterface } from '../shared/territory/common/interfaces/TerritoryDbMetaInterface';
import {
  ParamsInterface as CreateParams,
  ResultInterface as CreateResultInterface,
} from '../shared/territory/create.contract';
import { ParamsInterface as PatchParamsInterface } from '../shared/territory/update.contract';
import {
  TerritoryQueryInterface,
  SortEnum,
  ProjectionFieldsEnum,
  TerritoryListFilter,
} from '../shared/territory/common/interfaces/TerritoryQueryInterface';
import { ContactsInterface } from '../shared/common/interfaces/ContactsInterface';
import { TerritoryLevelEnum } from '../shared/territory/common/interfaces/TerritoryInterface';

export interface TerritoryRepositoryProviderInterface {
  find(
    query: TerritoryQueryInterface,
    sort: SortEnum[],
    projection: ProjectionFieldsEnum,
    pagination?: TerritoryListFilter,
  ): Promise<TerritoryDbMetaInterface>;

  all(
    search?: string,
    levels?: TerritoryLevelEnum[],
    withParents?: boolean,
    withLevel?: boolean,
    limit?: number,
    skip?: number,
  ): Promise<{ rows: TerritoryDbMetaInterface[]; count: number }>;
  create(data: CreateParams): Promise<CreateResultInterface>;
  delete(_id: number): Promise<void>;
  update(data: PatchParamsInterface): Promise<TerritoryDbMetaInterface>;
  patchContacts(id: number, contacts: ContactsInterface): Promise<TerritoryDbMetaInterface>;
  patch(id: number, patch: { [k: string]: any }): Promise<TerritoryDbMetaInterface>;
}

export abstract class TerritoryRepositoryProviderInterfaceResolver implements TerritoryRepositoryProviderInterface {
  async find(
    query: TerritoryQueryInterface,
    sort: SortEnum[],
    projection: ProjectionFieldsEnum,
    pagination?: TerritoryListFilter,
  ): Promise<TerritoryDbMetaInterface> {
    throw new Error();
  }

  async all(
    search?: string,
    levels?: TerritoryLevelEnum[],
    withParents?: boolean,
    withLevel?: boolean,
    limit?: number,
    skip?: number,
  ): Promise<{ rows: TerritoryDbMetaInterface[]; count: number }> {
    throw new Error();
  }

  async patchContacts(id: number, contacts: ContactsInterface): Promise<TerritoryDbMetaInterface> {
    throw new Error();
  }

  async create(data: CreateParams): Promise<CreateResultInterface> {
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
}
