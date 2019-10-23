import { RepositoryInterface, RepositoryInterfaceResolver } from '@ilos/common';

import { UserInterface } from '../shared/user/common/interfaces/UserInterface';
import { UserIdInterface } from '../shared/user/common/interfaces/UserIdInterface';
import { UserPatchInterface } from '../shared/user/common/interfaces/UserPatchInterface';
import { UserForgottenInterface } from '../shared/user/common/interfaces/UserForgottenInterface';
import { PaginationSkipParamsInterface } from '../shared/common/interfaces/PaginationSkipParamsInterface';
import { UserStatusInterface } from '../shared/user/common/interfaces/UserStatusInterface';

export interface UserRepositoryProviderInterface extends RepositoryInterface {
  list(
    filters: { territory?: string; operator?: string },
    pagination: PaginationSkipParamsInterface,
  ): Promise<{ users: UserStatusInterface[]; total: number }>;
  deleteUser(_id: string, contextParam: { territory?: string; operator?: string }): Promise<void>;
  findUser(_id: string, contextParam: { territory?: string; operator?: string }): Promise<UserInterface>;
  findUserByParams(params: { [prop: string]: string }): Promise<UserInterface>;
  findTokensByEmail({ email }: { email: string }): Promise<UserForgottenInterface>;
  patchUser(
    _id: string,
    patch: UserPatchInterface,
    contextParam: { territory?: string; operator?: string },
  ): Promise<UserIdInterface>;
}

export abstract class UserRepositoryProviderInterfaceResolver extends RepositoryInterfaceResolver {
  public async list(
    filters: { territory?: string; operator?: string },
    pagination: PaginationSkipParamsInterface,
  ): Promise<{ users: UserStatusInterface[]; total: number }> {
    throw new Error();
  }

  public async deleteUser(id: string, contextParam: { territory?: string; operator?: string }): Promise<void> {
    throw new Error();
  }

  public async findUser(id: string, contextParam: { territory?: string; operator?: string }): Promise<UserInterface> {
    throw new Error();
  }

  public async findUserByParams(params: { [prop: string]: string }): Promise<UserInterface> {
    throw new Error();
  }

  public async findTokensByEmail({ email }: { email: string }): Promise<UserForgottenInterface> {
    throw new Error();
  }

  public async patchUser(
    id: string,
    patch: UserPatchInterface,
    contextParam: { territory?: string; operator?: string },
  ): Promise<UserIdInterface> {
    throw new Error();
  }
}
