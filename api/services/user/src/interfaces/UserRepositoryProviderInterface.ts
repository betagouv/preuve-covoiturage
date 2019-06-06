import { ParentRepositoryProviderInterface, ParentRepositoryProviderInterfaceResolver } from '@pdc/provider-repository';

import { UserDbInterface } from './UserInterfaces';

import { User } from '../entities/User';

export interface UserRepositoryProviderInterface extends ParentRepositoryProviderInterface {
  findByEmail(email:string): Promise<UserDbInterface>;
  list(filters, pagination): Promise<{users: UserDbInterface[], total: number}>;
  deleteUser(id: string, contextParam: {aom?: string, operator?: string}): Promise<void>;
  findUser(id: string, contextParam: {aom?: string, operator?: string}): Promise<UserDbInterface>;
  findUser(id: string, patch: any, contextParam: {aom?: string, operator?: string}): Promise<UserDbInterface>;
}

export abstract class UserRepositoryProviderInterfaceResolver extends ParentRepositoryProviderInterfaceResolver {
  public async findByEmail(email: string): Promise<UserDbInterface> {
    return;
  }

  public async list(filters, pagination): Promise<{users: UserDbInterface[], total: number}> {
    return;
  }

  public async deleteUser(id: string, contextParam: {aom?: string, operator?: string}): Promise<void> {
    return;
  }

  public async findUser(id: string, contextParam: {aom?: string, operator?: string}): Promise<UserDbInterface> {
    return;
  }

  public async patchUser(id: string, patch: any, contextParam: {aom?: string, operator?: string}): Promise<UserDbInterface> {
    return;
  }
}
