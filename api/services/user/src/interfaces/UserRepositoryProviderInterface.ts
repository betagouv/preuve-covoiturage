import {
  UserFindInterface,
  UserPatchInterface,
  UserBaseInterface,
  UserListInterface,
  UserListFiltersInterface,
} from './UserInterface';
import { PaginationParamsInterface } from '../shared/common/interfaces/PaginationParamsInterface';

export interface UserRepositoryProviderInterface {
  create(data: UserBaseInterface): Promise<UserFindInterface>;

  list(
    filters: UserListFiltersInterface,
    pagination: PaginationParamsInterface,
  ): Promise<{ users: UserListInterface[]; total: number }>;

  delete(_id: string): Promise<void>;
  deleteByOperator(_id: string, operator_id: string): Promise<void>;
  deleteByTerritory(_id: string, territory_id: string): Promise<void>;

  find(_id: string): Promise<UserFindInterface | undefined>;
  findByOperator(_id: string, operator_id: string): Promise<UserFindInterface | undefined>;
  findByTerritory(_id: string, territory_id: string): Promise<UserFindInterface | undefined>;
  findByEmail(email: string): Promise<UserFindInterface | undefined>;

  // update(data: UserDbInterface): Promise<UserDbInterface>;
  // updateByOperator(data: UserDbInterface, operator_id: string): Promise<UserDbInterface>;
  // updateByTerritory(data: UserDbInterface, territory_id: string): Promise<UserDbInterface>;

  patch(_id: string, data: UserPatchInterface): Promise<UserFindInterface>;
  patchByOperator(_id: string, data: UserPatchInterface, operator_id: string): Promise<UserFindInterface>;
  patchByTerritory(_id: string, data: UserPatchInterface, territory_id: string): Promise<UserFindInterface>;
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

  async delete(_id: string): Promise<void> {
    throw new Error();
  }

  async deleteByOperator(_id: string, operator_id: string): Promise<void> {
    throw new Error();
  }

  async deleteByTerritory(_id: string, territory_id: string): Promise<void> {
    throw new Error();
  }

  async find(_id: string): Promise<UserFindInterface | undefined> {
    throw new Error();
  }

  async findByOperator(_id: string, operator_id: string): Promise<UserFindInterface | undefined> {
    throw new Error();
  }

  async findByTerritory(_id: string, territory_id: string): Promise<UserFindInterface | undefined> {
    throw new Error();
  }

  async findByEmail(email: string): Promise<UserFindInterface | undefined> {
    throw new Error();
  }

  // async update(data: UserDbInterface): Promise<UserDbInterface> {
  //   throw new Error();
  // }

  // async updateByOperator(data: UserDbInterface, operator_id: string): Promise<UserDbInterface> {
  //   throw new Error();
  // }

  // async updateByTerritory(data: UserDbInterface, territory_id: string): Promise<UserDbInterface> {
  //   throw new Error();
  // }

  async patch(_id: string, data: UserPatchInterface): Promise<UserFindInterface> {
    throw new Error();
  }

  async patchByOperator(_id: string, data: UserPatchInterface, operator_id: string): Promise<UserFindInterface> {
    throw new Error();
  }

  async patchByTerritory(_id: string, data: UserPatchInterface, territory_id: string): Promise<UserFindInterface> {
    throw new Error();
  }
}
