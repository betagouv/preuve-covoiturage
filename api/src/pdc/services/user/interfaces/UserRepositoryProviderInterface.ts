import { PaginationParamsInterface } from "@/shared/common/interfaces/PaginationParamsInterface.ts";
import { UserCreateInterface } from "@/shared/user/common/interfaces/UserCreateInterface.ts";
import { UserPatchInterface } from "@/shared/user/common/interfaces/UserPatchInterface.ts";
import { UserFindInterface } from "@/shared/user/common/interfaces/UserFindInterface.ts";
import { UserLastLoginInterface } from "@/shared/user/common/interfaces/UserLastLoginInterface.ts";
import { UserListInterface } from "@/shared/user/common/interfaces/UserListInterface.ts";
import { UserListFiltersInterface } from "@/shared/user/common/interfaces/UserListFiltersInterface.ts";
import { UserPatchInterfaceBy } from "@/shared/user/common/interfaces/UserPatchInterfaceBy.ts";
import { ResultInterface as HasUsersResultsInterface } from "@/shared/user/hasUsers.contract.ts";

export interface UserRepositoryProviderInterface {
  create(data: UserCreateInterface): Promise<UserFindInterface>;

  list(
    filters: UserListFiltersInterface,
    pagination: PaginationParamsInterface,
  ): Promise<{ users: UserListInterface[]; total: number }>;

  delete(_id: number): Promise<boolean>;
  deleteByOperator(_id: number, operator_id: number): Promise<boolean>;
  deleteByTerritory(_id: number, territory_id: number): Promise<boolean>;
  deleteAssociated(key: string, value: number): Promise<void>;

  find(_id: number): Promise<UserFindInterface | undefined>;
  findByOperator(
    _id: number,
    operator_id: number,
  ): Promise<UserFindInterface | undefined>;
  findByTerritory(
    _id: number,
    territory_id: number,
  ): Promise<UserFindInterface | undefined>;
  findByEmail(email: string): Promise<UserFindInterface | undefined>;
  findInactive(months?: number): Promise<UserLastLoginInterface[]>;

  patch(
    _id: number,
    data: UserPatchInterface,
  ): Promise<UserFindInterface | undefined>;
  patchByOperator(
    _id: number,
    data: UserPatchInterface,
    operator_id: number,
  ): Promise<UserFindInterface | undefined>;
  patchByTerritory(
    _id: number,
    data: UserPatchInterface,
    territory_id: number,
  ): Promise<UserFindInterface | undefined>;

  touchLastLogin(_id: number): Promise<void>;
}

export abstract class UserRepositoryProviderInterfaceResolver
  implements UserRepositoryProviderInterface {
  async create(data: UserCreateInterface): Promise<UserFindInterface> {
    throw new Error();
  }

  async list(
    filters: UserListFiltersInterface,
    pagination: PaginationParamsInterface,
  ): Promise<{ users: UserListInterface[]; total: number }> {
    throw new Error();
  }

  async delete(_id: number): Promise<boolean> {
    throw new Error();
  }

  async deleteByOperator(_id: number, operator_id: number): Promise<boolean> {
    throw new Error();
  }

  async deleteByTerritory(_id: number, territory_id: number): Promise<boolean> {
    throw new Error();
  }

  async deleteAssociated(key: string, value: number): Promise<void> {
    throw new Error();
  }

  async find(_id: number): Promise<UserFindInterface | undefined> {
    throw new Error();
  }

  async findByOperator(
    _id: number,
    operator_id: number,
  ): Promise<UserFindInterface | undefined> {
    throw new Error();
  }

  async findByTerritory(
    _id: number,
    territory_id: number,
  ): Promise<UserFindInterface | undefined> {
    throw new Error();
  }

  async findByEmail(email: string): Promise<UserFindInterface | undefined> {
    throw new Error();
  }

  async findInactive(months?: number): Promise<UserLastLoginInterface[]> {
    throw new Error();
  }

  async patchRole(
    _id: number,
    role: string,
    roleSuffixOnly?: boolean,
  ): Promise<void> {
    throw new Error();
  }

  async patch(
    _id: number,
    data: UserPatchInterfaceBy,
  ): Promise<UserFindInterface | undefined> {
    throw new Error();
  }

  async patchByOperator(
    _id: number,
    data: UserPatchInterfaceBy,
    operator_id: number,
  ): Promise<UserFindInterface | undefined> {
    throw new Error();
  }

  async patchByTerritory(
    _id: number,
    data: UserPatchInterfaceBy,
    territory_id: number,
  ): Promise<UserFindInterface | undefined> {
    throw new Error();
  }
  async checkForDoubleEmailAndFail(email: string, userId = -1): Promise<void> {
    throw new Error();
  }
  async hasUsers(): Promise<HasUsersResultsInterface> {
    throw new Error();
  }
  async touchLastLogin(_id: number): Promise<void> {
    throw new Error();
  }
}
