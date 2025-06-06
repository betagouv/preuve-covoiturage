import type {
  ParamsInterface as CreateParamsInterface,
  ResultInterface as CreateResultInterface,
} from "@/pdc/services/territory/contracts/create.contract.ts";
import type {
  ParamsInterface as ListParamsInterface,
  ResultInterface as ListResultInterface,
} from "@/pdc/services/territory/contracts/list.contract.ts";
import { TerritoryParams } from "./../actions/group/ListTerritoryActionV2.ts";

import type {
  ParamsInterface as FindParamsInterface,
  ResultInterface as FindResultInterface,
} from "@/pdc/services/territory/contracts/find.contract.ts";

import type {
  ParamsInterface as UpdateParamsInterface,
  ResultInterface as UpdateResultInterface,
} from "@/pdc/services/territory/contracts/update.contract.ts";

import type { TerritorySelectorsInterface } from "@/pdc/services/territory/contracts/common/interfaces/TerritoryCodeInterface.ts";
import type {
  ParamsInterface as PatchContactsParamsInterface,
  ResultInterface as PatchContactsResultInterface,
} from "@/pdc/services/territory/contracts/patchContacts.contract.ts";

export type {
  CreateParamsInterface,
  CreateResultInterface,
  FindParamsInterface,
  FindResultInterface,
  ListParamsInterface,
  ListResultInterface,
  PatchContactsParamsInterface,
  PatchContactsResultInterface,
  UpdateParamsInterface,
  UpdateResultInterface,
};
export interface TerritoryRepositoryProviderInterface {
  list(params: ListParamsInterface): Promise<ListResultInterface>;
  find(params: FindParamsInterface): Promise<FindResultInterface>;
  create(data: CreateParamsInterface): Promise<CreateResultInterface>;
  delete(_id: number): Promise<void>;
  update(data: UpdateParamsInterface): Promise<UpdateResultInterface>;
  patchContacts(
    params: PatchContactsParamsInterface,
  ): Promise<PatchContactsResultInterface>;
  getRelationCodes(
    params: { _id: number },
  ): Promise<TerritorySelectorsInterface>;
  getRelationCodesCom(
    params: { _id: number },
  ): Promise<TerritorySelectorsInterface>;
}

export abstract class TerritoryRepositoryProviderInterfaceResolver implements TerritoryRepositoryProviderInterface {
  async list(params: TerritoryParams): Promise<ListResultInterface> {
    throw new Error();
  }

  async find(params: FindParamsInterface): Promise<FindResultInterface> {
    throw new Error();
  }

  async patchContacts(
    params: PatchContactsParamsInterface,
  ): Promise<PatchContactsResultInterface> {
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

  async getRelationCodes(
    params: { _id: number },
  ): Promise<TerritorySelectorsInterface> {
    throw new Error();
  }

  async getRelationCodesCom(
    params: { _id: number },
  ): Promise<TerritorySelectorsInterface> {
    throw new Error();
  }
}
