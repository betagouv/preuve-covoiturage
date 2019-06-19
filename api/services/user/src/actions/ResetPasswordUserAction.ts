import { Parents, Container, Types, Exceptions } from '@ilos/core';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { User } from '../entities/User';
import { UserResetPasswordParamsInterface } from '../interfaces/actions/UserResetPasswordParamsInterface';
import { userWhiteListFilterOutput } from '../config/filterOutput';

/*
 * Find user by forgottenReset and update password
 */
@Container.handler({
  service: 'user',
  method: 'resetPassword',
})
export class ResetPasswordUserAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'user.resetPassword'],
    ['content.whitelist', userWhiteListFilterOutput],
  ];

  constructor(
    private config: ConfigProviderInterfaceResolver,
    private cryptoProvider: CryptoProviderInterfaceResolver,
    private userRepository: UserRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: UserResetPasswordParamsInterface, context: Types.ContextType): Promise<User> {
    const user = await this.userRepository.findUserByParams({ forgottenReset: params.reset });

    if (!(await this.cryptoProvider.compareForgottenToken(params.token, user.forgottenToken))) {
      throw new Exceptions.ForbiddenException('Invalid token');
    }

    // Token expired after 1 day
    if ((Date.now() - user.forgottenAt.getTime()) / 1000 > this.config.get('user.tokenExpiration.passwordReset')) {
      user.forgottenReset = undefined;
      user.forgottenToken = undefined;
      await this.userRepository.update(user);

      throw new Exceptions.ForbiddenException('Expired token');
    }

    user.password = await this.cryptoProvider.cryptPassword(params.password);

    user.hasResetPassword = true;

    user.status = this.config.get('user.status.active');

    return this.userRepository.update(user);
  }
}
