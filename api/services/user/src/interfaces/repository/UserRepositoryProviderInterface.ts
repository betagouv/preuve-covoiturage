import { ParentRepositoryProviderInterface, ParentRepositoryProviderInterfaceResolver } from '@ilos/provider-repository';

import { User } from '../../entities/User';

export interface UserRepositoryProviderInterface extends ParentRepositoryProviderInterface {
  list(filters, pagination): Promise<{ users: User[]; total: number }>;
  deleteUser(_id: string, contextParam: { territory?: string; operator?: string }): Promise<void>;
  findUser(_id: string, contextParam: { territory?: string; operator?: string }): Promise<User>;
  findUserByParams(params: { [prop: string]: string }): Promise<User>;
  patchUser(_id: string, patch: any, contextParam: { territory?: string; operator?: string }): Promise<User>;
}

export abstract class UserRepositoryProviderInterfaceResolver extends ParentRepositoryProviderInterfaceResolver {
  public async list(filters, pagination): Promise<{ users: User[]; total: number }> {
    throw new Error();
  }

  public async deleteUser(id: string, contextParam: { territory?: string; operator?: string }): Promise<void> {
    throw new Error();
  }

  public async findUser(id: string, contextParam: { territory?: string; operator?: string }): Promise<User> {
    throw new Error();
  }

  public async findUserByParams(params: { [prop: string]: string }): Promise<User> {
    throw new Error();
  }

  public async patchUser(
    id: string,
    patch: any,
    contextParam: { territory?: string; operator?: string },
  ): Promise<User> {
    throw new Error();
  }
}
