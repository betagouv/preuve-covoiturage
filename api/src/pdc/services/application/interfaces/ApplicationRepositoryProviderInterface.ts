import { ApplicationInterface } from "../contracts/common/interfaces/ApplicationInterface.ts";
import { RepositoryInterface as CreateInterface } from "../contracts/create.contract.ts";
import { RepositoryInterface as FindInterface } from "../contracts/find.contract.ts";
import { RepositoryInterface as ListInterface } from "../contracts/list.contract.ts";
import { RepositoryInterface as RevokeInterface } from "../contracts/revoke.contract.ts";

export interface ApplicationRepositoryProviderInterface {
  list(data: ListInterface): Promise<ApplicationInterface[]>;
  find(data: FindInterface): Promise<ApplicationInterface>;
  create(data: CreateInterface): Promise<ApplicationInterface>;
  revoke(data: RevokeInterface): Promise<void>;
}

export abstract class ApplicationRepositoryProviderInterfaceResolver implements ApplicationRepositoryProviderInterface {
  async list(data: ListInterface): Promise<ApplicationInterface[]> {
    throw new Error("Method not implemented.");
  }
  async find(data: FindInterface): Promise<ApplicationInterface> {
    throw new Error("Method not implemented.");
  }
  async create(data: CreateInterface): Promise<ApplicationInterface> {
    throw new Error("Method not implemented.");
  }
  async revoke(data: RevokeInterface): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
