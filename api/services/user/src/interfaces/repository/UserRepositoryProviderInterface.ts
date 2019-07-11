import { ParentRepositoryInterface, ParentRepositoryInterfaceResolver } from '@ilos/repository';

import { User } from '../../entities/User';

export interface UserRepositoryProviderInterface extends ParentRepositoryInterface {
  list(filters, pagination): Promise<{ users: User[]; total: number }>;
  deleteUser(_id: string, contextParam: { territory?: string; operator?: string }): Promise<void>;
  findUser(_id: string, contextParam: { territory?: string; operator?: string }): Promise<User>;
  findUserByEmail(email: string): Promise<User>;
  findUserByToken(param: { emailConfirm?: string; forgottenReset?: string }): Promise<User>;
  patchUser(_id: string, patch: any, contextParam: { territory?: string; operator?: string }): Promise<User>;
}

export abstract class UserRepositoryProviderInterfaceResolver extends ParentRepositoryInterfaceResolver {
  public async list(filters, pagination): Promise<{ users: User[]; total: number }> {
    throw new Error();
  }

  public async deleteUser(id: string, contextParam: { territory?: string; operator?: string }): Promise<void> {
    throw new Error();
  }

  public async findUser(id: string, contextParam: { territory?: string; operator?: string }): Promise<User> {
    throw new Error();
  }

  public async findUserByEmail(email: string): Promise<User> {
    throw new Error();
  }

  public async findUserByToken(param: { emailConfirm?: string; forgottenReset?: string }): Promise<User> {
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
