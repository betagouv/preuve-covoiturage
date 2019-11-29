import { PaginationParamsInterface } from '../shared/common/interfaces/PaginationParamsInterface';
import { UserBaseInterface } from '../shared/user/common/interfaces/UserBaseInterface';
import { UserPatchInterface } from '../shared/user/common/interfaces/UserPatchInterface';
import { UserFindInterface } from '../shared/user/common/interfaces/UserFindInterface';
import { UserListInterface } from '../shared/user/common/interfaces/UserListInterface';
import { UserListFiltersInterface } from '../shared/user/common/interfaces/UserListFiltersInterface';
import { UserPatchInterfaceBy } from '../shared/user/common/interfaces/UserPatchInterfaceBy';

export interface UserRepositoryProviderInterface {
  create(data: UserBaseInterface): Promise<UserFindInterface>;

  list(
    filters: UserListFiltersInterface,
    pagination: PaginationParamsInterface,
  ): Promise<{ users: UserListInterface[]; total: number }>;

  delete(_id: number): Promise<boolean>;
  deleteByOperator(_id: number, operator_id: number): Promise<boolean>;
  deleteByTerritory(_id: number, territory_id: number): Promise<boolean>;

  find(_id: number): Promise<UserFindInterface | undefined>;
  findByOperator(_id: number, operator_id: number): Promise<UserFindInterface | undefined>;
  findByTerritory(_id: number, territory_id: number): Promise<UserFindInterface | undefined>;
  findByEmail(email: string): Promise<UserFindInterface | undefined>;

  patch(_id: number, data: UserPatchInterface): Promise<UserFindInterface>;
  patchByOperator(_id: number, data: UserPatchInterface, operator_id: number): Promise<UserFindInterface>;
  patchByTerritory(_id: number, data: UserPatchInterface, territory_id: number): Promise<UserFindInterface>;
}

export abstract class UserRepositoryProviderInterfaceResolver implements UserRepositoryProviderInterface {
  async create(data: UserBaseInterface): Promise<UserFindInterface> {
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

  async find(_id: number): Promise<UserFindInterface | undefined> {
    throw new Error();
  }

  async findByOperator(_id: number, operator_id: number): Promise<UserFindInterface | undefined> {
    throw new Error();
  }

  async findByTerritory(_id: number, territory_id: number): Promise<UserFindInterface | undefined> {
    throw new Error();
  }

  async findByEmail(email: string): Promise<UserFindInterface | undefined> {
    throw new Error();
  }

  async patch(_id: number, data: UserPatchInterfaceBy): Promise<UserFindInterface> {
    throw new Error();
  }

  async patchByOperator(_id: number, data: UserPatchInterfaceBy, operator_id: number): Promise<UserFindInterface> {
    throw new Error();
  }

  async patchByTerritory(_id: number, data: UserPatchInterfaceBy, territory_id: number): Promise<UserFindInterface> {
    throw new Error();
  }
}
