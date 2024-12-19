import type {
  ParamsInterface as UsersParamsInterface,
  ResultInterface as UsersResultInterface,
} from "../contracts/users/users.contract.ts";

export type { UsersParamsInterface, UsersResultInterface };

export interface UsersRepositoryInterface {
  getUsers(
    params: UsersParamsInterface,
  ): Promise<UsersResultInterface>;
}

export abstract class UsersRepositoryInterfaceResolver implements UsersRepositoryInterface {
  async getUsers(
    params: UsersParamsInterface,
  ): Promise<UsersResultInterface> {
    throw new Error();
  }
}
