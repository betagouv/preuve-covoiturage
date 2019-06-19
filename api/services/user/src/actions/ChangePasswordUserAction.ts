import { Parents, Container, Exceptions } from '@ilos/core';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { UserContextInterface } from '../interfaces/UserContextInterfaces';
import { User } from '../entities/User';
import { UserChangePasswordParamsInterface } from '../interfaces/actions/UserChangePasswordParamsInterface';
import { userWhiteListFilterOutput } from '../config/filterOutput';

/*
 * Change password of user by sending old & new password
 */
@Container.handler({
  service: 'user',
  method: 'changePassword',
})
export class ChangePasswordUserAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'user.changePassword'],
    ['can', ['profile.update']],
    ['content.whitelist', userWhiteListFilterOutput],
  ];
  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private cryptoProvider: CryptoProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: UserChangePasswordParamsInterface, context: UserContextInterface): Promise<User> {
    const user = await this.userRepository.find(context.call.user._id);
    if (!(await this.cryptoProvider.comparePassword(params.oldPassword, user.password))) {
      throw new Exceptions.ForbiddenException('Wrong credentials');
    }

    // change the password
    const newHashPassword = await this.cryptoProvider.cryptPassword(params.newPassword);

    return this.userRepository.patch(user._id, { password: newHashPassword });
  }
}
