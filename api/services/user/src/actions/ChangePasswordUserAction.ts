import { Action as AbstractAction } from '@ilos/core';
import { handler, ForbiddenException } from '@ilos/common';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { UserChangePasswordParamsInterface } from '@pdc/provider-schema';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserContextInterface } from '../interfaces/UserContextInterfaces';
import { User } from '../entities/User';
import { userWhiteListFilterOutput } from '../config/filterOutput';

/*
 * Change password of user by sending old & new password
 */
@handler({
  service: 'user',
  method: 'changePassword',
})
export class ChangePasswordUserAction extends AbstractAction {
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
    if (!(await this.cryptoProvider.comparePassword(params.old_password, user.password))) {
      throw new ForbiddenException('Wrong credentials');
    }

    // change the password
    const newHashPassword = await this.cryptoProvider.cryptPassword(params.new_password);

    return this.userRepository.patch(user._id, { password: newHashPassword });
  }
}
