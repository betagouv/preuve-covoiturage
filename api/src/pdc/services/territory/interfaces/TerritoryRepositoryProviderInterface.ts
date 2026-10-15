import type {
  ParamsInterface as CreateParamsInterface,
  ResultInterface as CreateResultInterface,
} from "@/pdc/services/territory/contracts/create.contract.ts";
import type { ResultInterface as ListResultInterface } from "@/pdc/services/territory/contracts/list.contract.ts";
import { TerritoryParams } from "./../actions/group/ListTerritoryActionV2.ts";

export type { CreateParamsInterface, CreateResultInterface, ListResultInterface };
export interface TerritoryRepositoryProviderInterface {
  list(params: TerritoryParams): Promise<ListResultInterface>;
  create(data: CreateParamsInterface): Promise<CreateResultInterface>;
  delete(_id: number): Promise<void>;
}

export abstract class TerritoryRepositoryProviderInterfaceResolver implements TerritoryRepositoryProviderInterface {
  async list(params: TerritoryParams): Promise<ListResultInterface> {
    throw new Error();
  }

  async create(data: CreateParamsInterface): Promise<CreateResultInterface> {
    throw new Error();
  }

  async delete(_id: number): Promise<void> {
    throw new Error();
  }
}
