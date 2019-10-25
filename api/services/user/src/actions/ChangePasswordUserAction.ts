import { Action as AbstractAction } from '@ilos/core';
import { handler, ForbiddenException } from '@ilos/common';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { configHandler, ParamsInterface, ResultInterface } from '../shared/user/changePassword.contract';
import { alias } from '../shared/user/changePassword.schema';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { UserContextInterface } from '../shared/user/common/interfaces/UserContextInterfaces';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { userWhiteListFilterOutput } from '../config/filterOutput';

/*
 * Change password of user by sending old & new password
 */
@handler(configHandler)
export class ChangePasswordUserAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [
    ['validate', alias],
    ['can', ['profile.update']],
    ['content.whitelist', userWhiteListFilterOutput],
  ];
  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private cryptoProvider: CryptoProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: UserContextInterface): Promise<ResultInterface> {
    const user = await this.userRepository.find(context.call.user._id);
    if (!(await this.cryptoProvider.comparePassword(params.old_password, user.password))) {
      throw new ForbiddenException('Wrong credentials');
    }

    // change the password
    const newHashPassword = await this.cryptoProvider.cryptPassword(params.new_password);

    return this.userRepository.patch(user._id, { password: newHashPassword });
  }
}
