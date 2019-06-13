import * as _ from 'lodash';

import { Parents, Container, Exceptions } from '@ilos/core';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserContextInterface } from '../interfaces/UserContextInterfaces';
import { User } from '../entities/User';
import { UserChangePasswordParamsInterface } from '../interfaces/UserChangePasswordParamsInterface';

/*
 * Change password of user by sending old & new password
 */
@Container.handler({
  service: 'user',
  method: 'changePassword',
})
export class ChangePasswordUserAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [['validate', 'user.changePassword']];
  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private cryptoProvider: CryptoProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: UserChangePasswordParamsInterface, context: UserContextInterface): Promise<User> {
    const user = await this.userRepository.find(params.id);

    if (!(await this.cryptoProvider.comparePassword(params.oldPassword, user.password))) {
      throw new Exceptions.ForbiddenException('Wrong credentials');
    }

    // same password ?
    if (params.oldPassword === params.newPassword) return user; // can json schema check this ?

    // change the password
    const newHashPassword = await this.cryptoProvider.cryptPassword(params.newPassword);

    return this.userRepository.patch(user._id, { password: newHashPassword });
  }
}
