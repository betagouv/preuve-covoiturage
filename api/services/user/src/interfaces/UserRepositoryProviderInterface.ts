import { ParentRepositoryProviderInterface, ParentRepositoryProviderInterfaceResolver } from '@ilos/provider-repository';

import { User } from '../entities/User';

export interface UserRepositoryProviderInterface extends ParentRepositoryProviderInterface {
  findByEmail(email: string): Promise<User | undefined>;
  list(filters, pagination): Promise<{ users: User[]; total: number }>;
  deleteUser(id: string, contextParam: { aom?: string; operator?: string }): Promise<void>;
  findUser(id: string, contextParam: { aom?: string; operator?: string }): Promise<User>;
  patchUser(id: string, patch: any, contextParam: { aom?: string; operator?: string }): Promise<User>;
  findUserByParam(param: { [prop: string]: string }): Promise<User>;
}

export abstract class UserRepositoryProviderInterfaceResolver extends ParentRepositoryProviderInterfaceResolver {
  public async findByEmail(email: string): Promise<User | undefined> {
    throw new Error();
  }

  public async list(filters, pagination): Promise<{ users: User[]; total: number }> {
    throw new Error();
  }

  public async deleteUser(id: string, contextParam: { aom?: string; operator?: string }): Promise<void> {
    throw new Error();
  }

  public async findUser(id: string, contextParam: { aom?: string; operator?: string }): Promise<User> {
    throw new Error();
  }

  public async findUserByParam(param: { [prop: string]: string }): Promise<User> {
    throw new Error();
  }

  public async patchUser(id: string, patch: any, contextParam: { aom?: string; operator?: string }): Promise<User> {
    throw new Error();
  }
}
