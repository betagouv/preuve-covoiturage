import { ParentRepositoryInterface, ParentRepositoryInterfaceResolver } from '@ilos/repository';

import { User } from '../../entities/User';

export interface UserRepositoryProviderInterface extends ParentRepositoryInterface {
  list(filters, pagination): Promise<{ users: User[]; total: number }>;
  deleteByContext(_id: string, contextParam: { territory?: string; operator?: string }): Promise<void>;
  findByContext(_id: string, contextParam: { territory?: string; operator?: string }): Promise<User>;
  findByEmail(email: string): Promise<User>;
  findByToken(param: { emailConfirm?: string; forgottenReset?: string }): Promise<User>;
  patchByContext(_id: string, patch: any, contextParam: { territory?: string; operator?: string }): Promise<User>;
}

export abstract class UserRepositoryProviderInterfaceResolver extends ParentRepositoryInterfaceResolver {
  public async list(filters, pagination): Promise<{ users: User[]; total: number }> {
    throw new Error();
  }

  public async deleteByContext(id: string, contextParam: { territory?: string; operator?: string }): Promise<void> {
    throw new Error();
  }

  public async findByContext(id: string, contextParam: { territory?: string; operator?: string }): Promise<User> {
    throw new Error();
  }

  public async findByEmail(email: string): Promise<User> {
    throw new Error();
  }

  public async findByToken(param: { emailConfirm?: string; forgottenReset?: string }): Promise<User> {
    throw new Error();
  }

  public async patchByContext(
    id: string,
    patch: any,
    contextParam: { territory?: string; operator?: string },
  ): Promise<User> {
    throw new Error();
  }
}
