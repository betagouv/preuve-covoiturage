import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, ConfigInterfaceResolver, ForbiddenException } from '@ilos/common';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { UserResetPasswordParamsInterface } from '@pdc/provider-schema';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { User } from '../entities/User';
import { userWhiteListFilterOutput } from '../config/filterOutput';

/*
 * Find user by forgottenReset and update password
 */
@handler({
  service: 'user',
  method: 'resetPassword',
})
export class ResetPasswordUserAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'user.resetPassword'],
    ['content.whitelist', userWhiteListFilterOutput],
  ];

  constructor(
    private config: ConfigInterfaceResolver,
    private cryptoProvider: CryptoProviderInterfaceResolver,
    private userRepository: UserRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: UserResetPasswordParamsInterface, context: ContextType): Promise<User> {
    const user = await this.userRepository.findUserByParams({ forgottenReset: params.reset });

    if (!(await this.cryptoProvider.compareForgottenToken(params.token, user.forgottenToken))) {
      throw new ForbiddenException('Invalid token');
    }

    // Token expired after 1 day
    if ((Date.now() - user.forgottenAt.getTime()) / 1000 > this.config.get('user.tokenExpiration.passwordReset')) {
      user.forgottenReset = undefined;
      user.forgottenToken = undefined;
      await this.userRepository.update(user);

      throw new ForbiddenException('Expired token');
    }

    user.password = await this.cryptoProvider.cryptPassword(params.password);

    user.hasResetPassword = true;

    user.status = this.config.get('user.status.active');

    return this.userRepository.update(user);
  }
}
