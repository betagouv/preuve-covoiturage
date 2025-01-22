import type { ResultInterface as UsersResultInterface } from "@/pdc/services/dashboard/actions/UsersAction.ts";
import { Users as UsersParamsInterface } from "@/pdc/services/dashboard/dto/Users.ts";

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
