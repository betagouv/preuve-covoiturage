import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, ConfigInterfaceResolver, ForbiddenException } from '@ilos/common';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { UserConfirmEmailParamsInterface } from '@pdc/provider-schema';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { User } from '../entities/User';
import { userWhiteListFilterOutput } from '../config/filterOutput';

/*
 * Confirm email by getting user from 'confirm' and verifying uncrypted 'token' with crypted 'email_token'
 */
@handler({
  service: 'user',
  method: 'confirmEmail',
})
export class ConfirmEmailUserAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'user.confirmEmail'],
    ['content.whitelist', userWhiteListFilterOutput],
  ];

  constructor(
    private config: ConfigInterfaceResolver,
    private cryptoProvider: CryptoProviderInterfaceResolver,
    private userRepository: UserRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: UserConfirmEmailParamsInterface, context: ContextType): Promise<User> {
    const user = await this.userRepository.findUserByParams({ email_confirm: params.confirm });

    if (!(await this.cryptoProvider.compareForgottenToken(params.token, user.email_token))) {
      throw new ForbiddenException('Invalid token');
    }

    // Token expired after 1 day
    if ((Date.now() - user.email_change_at.getTime()) / 1000 > this.config.get('user.tokenExpiration.email_confirm')) {
      user.email_confirm = undefined;
      user.email_token = undefined;
      await this.userRepository.update(user);

      throw new ForbiddenException('Expired token');
    }

    user.status = this.config.get('user.status.active');

    return this.userRepository.update(user);
  }
}
