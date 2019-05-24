import { ParentRepositoryProviderInterface, ParentRepositoryProviderInterfaceResolver } from '@pdc/provider-repository';

import { User } from '../entities/User';
import { UserDbInterface } from './UserInterfaces';

import { User } from '../entities/User';

export interface UserRepositoryProviderInterface extends ParentRepositoryProviderInterface {
  findByEmail(email:string): Promise<User>;
  list(filters, pagination): Promise<{users: UserDbInterface[], total: number}>;
}

export abstract class UserRepositoryProviderInterfaceResolver extends ParentRepositoryProviderInterfaceResolver {
  public async findByEmail(email: string): Promise<UserDbInterface> {
    return;
  }

  public async list(filters, pagination): Promise<{users: UserDbInterface[], total: number}> {
    return;
  }
}
