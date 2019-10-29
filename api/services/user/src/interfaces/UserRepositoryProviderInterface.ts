import { UserDbInterface, UserPatchInterface, UserCreateInterface } from './UserInterface';
import { PaginationSkipParamsInterface } from '../shared/common/interfaces/PaginationSkipParamsInterface';

export interface UserRepositoryProviderInterface {
  create(data: UserCreateInterface): Promise<UserDbInterface>;

  list(
    filters: { territory?: string; operator?: string },
    pagination: PaginationSkipParamsInterface,
  ): Promise<{ users: UserDbInterface[]; total: number }>;

  delete(_id: string): Promise<void>;
  deleteByOperator(_id: string, operator_id: string): Promise<void>;
  deleteByTerritory(_id: string, territory_id: string): Promise<void>;

  find(_id: string): Promise<UserDbInterface>;
  findByOperator(_id: string, operator_id: string): Promise<UserDbInterface>;
  findByTerritory(_id: string, territory_id: string): Promise<UserDbInterface>;
  findByEmail(email: string): Promise<UserDbInterface>;

  update(data: UserDbInterface): Promise<UserDbInterface>;
  updateByOperator(data: UserDbInterface, operator_id: string): Promise<UserDbInterface>;
  updateByTerritory(data: UserDbInterface, territory_id: string): Promise<UserDbInterface>;
  patch(_id: string, data: UserPatchInterface): Promise<UserDbInterface>;
}

export abstract class UserRepositoryProviderInterfaceResolver implements UserRepositoryProviderInterface {
  async create(data: UserDbInterface): Promise<UserDbInterface> {
    throw new Error();
  }

  async list(
    filters: { territory?: string; operator?: string },
    pagination: PaginationSkipParamsInterface,
  ): Promise<{ users: UserDbInterface[]; total: number }> {
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

  async find(_id: string): Promise<UserDbInterface> {
    throw new Error();
  }

  async findByOperator(_id: string, operator_id: string): Promise<UserDbInterface> {
    throw new Error();
  }

  async findByTerritory(_id: string, territory_id: string): Promise<UserDbInterface> {
    throw new Error();
  }

  async findByEmail(email: string): Promise<UserDbInterface> {
    throw new Error();
  }

  async update(data: UserDbInterface): Promise<UserDbInterface> {
    throw new Error();
  }

  async updateByOperator(data: UserDbInterface, operator_id: string): Promise<UserDbInterface> {
    throw new Error();
  }

  async updateByTerritory(data: UserDbInterface, territory_id: string): Promise<UserDbInterface> {
    throw new Error();
  }

  async patch(_id: string, data: UserPatchInterface): Promise<UserDbInterface> {
    throw new Error();
  }
}
