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
import { TerritoryParentChildrenInterface } from '../shared/territory/common/interfaces/TerritoryChildrenInterface';
import { UiStatusRelationDetails } from '../shared/territory/relationUiStatus.contract';
import { ContactsInterface } from '../shared/common/interfaces/ContactsInterface';
import { TerritoryLevelEnum } from '../shared/territory/common/interfaces/TerritoryInterface';

export interface TerritoryRepositoryProviderInterface {
  find(
    query: TerritoryQueryInterface,
    sort: SortEnum[],
    projection: ProjectionFieldsEnum,
    pagination?: TerritoryListFilter,
  ): Promise<TerritoryDbMetaInterface>;

  getRelationUiStatusDetails(id: number): Promise<UiStatusRelationDetails[]>;
  all(
    search?: string,
    levels?: TerritoryLevelEnum[],
    limit?: number,
    skip?: number,
  ): Promise<{ rows: TerritoryDbMetaInterface[]; count: number }>;
  create(data: CreateParams): Promise<CreateResultInterface>;
  delete(_id: number): Promise<void>;
  update(data: PatchParamsInterface): Promise<TerritoryDbMetaInterface>;
  patchContacts(id: number, contacts: ContactsInterface): Promise<TerritoryDbMetaInterface>;
  patch(id: number, patch: { [k: string]: any }): Promise<TerritoryDbMetaInterface>;
  findByInsee(insee: string): Promise<TerritoryDbMetaInterface>;
  findByPosition(lon: number, lat: number): Promise<TerritoryDbMetaInterface>;
  getDirectRelation(id: number | number[]): Promise<TerritoryParentChildrenInterface>;
  tree(): Promise<any>;
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

  async getDirectRelation(id: number | number[]): Promise<TerritoryParentChildrenInterface> {
    throw new Error();
  }

  async all(
    search?: string,
    levels?: TerritoryLevelEnum[],
    limit?: number,
    skip?: number,
  ): Promise<{ rows: TerritoryDbMetaInterface[]; count: number }> {
    throw new Error();
  }
  async getRelationUiStatusDetails(id: number): Promise<UiStatusRelationDetails[]> {
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

  async findByInsee(insee: string): Promise<TerritoryDbMetaInterface> {
    throw new Error();
  }

  async findByPosition(lon: number, lat: number): Promise<TerritoryDbMetaInterface> {
    throw new Error();
  }

  async tree(): Promise<any> {
    throw new Error('Not implemented');
  }
}
