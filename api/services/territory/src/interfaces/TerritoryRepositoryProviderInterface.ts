import {
  ParamsInterface as CreateParamsInterface,
  ResultInterface as CreateResultInterface,
} from '../shared/territory/create.contract';

import {
  ParamsInterface as ListParamsInterface,
  ResultInterface as ListResultInterface,
} from '../shared/territory/list.contract';

import {
  ParamsInterface as FindParamsInterface,
  ResultInterface as FindResultInterface,
} from '../shared/territory/find.contract';

import {
  ParamsInterface as UpdateParamsInterface,
  ResultInterface as UpdateResultInterface,
} from '../shared/territory/update.contract';

import {
  ParamsInterface as PatchContactsParamsInterface,
  ResultInterface as PatchContactsResultInterface,
} from '../shared/territory/patchContacts.contract';
import { TerritorySelectorsInterface } from '../shared/territory/common/interfaces/TerritoryCodeInterface';

export {
  CreateParamsInterface,
  CreateResultInterface,
  ListParamsInterface,
  ListResultInterface,
  FindParamsInterface,
  FindResultInterface,
  UpdateParamsInterface,
  UpdateResultInterface,
  PatchContactsParamsInterface,
  PatchContactsResultInterface,
};
export interface TerritoryRepositoryProviderInterface {
  list(params: ListParamsInterface): Promise<ListResultInterface>;
  find(params: FindParamsInterface): Promise<FindResultInterface>;
  create(data: CreateParamsInterface): Promise<CreateResultInterface>;
  delete(_id: number): Promise<void>;
  update(data: UpdateParamsInterface): Promise<UpdateResultInterface>;
  patchContacts(params: PatchContactsParamsInterface): Promise<PatchContactsResultInterface>;
  getRelationCodes(params: { _id: number }): Promise<TerritorySelectorsInterface>;
  getRelationCodesCom(params: { _id: number }): Promise<TerritorySelectorsInterface>;
}

export abstract class TerritoryRepositoryProviderInterfaceResolver implements TerritoryRepositoryProviderInterface {
  async list(params: ListParamsInterface): Promise<ListResultInterface> {
    throw new Error();
  }

  async find(params: FindParamsInterface): Promise<FindResultInterface> {
    throw new Error();
  }

  async patchContacts(params: PatchContactsParamsInterface): Promise<PatchContactsResultInterface> {
    throw new Error();
  }

  async create(data: CreateParamsInterface): Promise<CreateResultInterface> {
    throw new Error();
  }

  async delete(_id: number): Promise<void> {
    throw new Error();
  }

  async update(data: UpdateParamsInterface): Promise<UpdateResultInterface> {
    throw new Error();
  }

  async getRelationCodes(params: { _id: number }): Promise<TerritorySelectorsInterface> {
    throw new Error();
  }

  async getRelationCodesCom(params: { _id: number }): Promise<TerritorySelectorsInterface> {
    throw new Error();
  }
}
