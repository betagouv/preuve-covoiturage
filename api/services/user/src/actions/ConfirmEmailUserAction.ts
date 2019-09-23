import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, UnauthorizedException } from '@ilos/common';
import { UserConfirmEmailParamsInterface } from '@pdc/provider-schema';

import { ForgottenTokenValidatorProviderInterface } from '../interfaces/ForgottenTokenValidatorProviderInterface';
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
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private tokenValidator: ForgottenTokenValidatorProviderInterface,
  ) {
    super();
  }

  public async handle(params: UserConfirmEmailParamsInterface, context: ContextType): Promise<User> {
    const user = await this.tokenValidator.checkToken(params.email, params.forgotten_token);
    if (this.tokenValidator.isExpired('confirmation', user.forgotten_at)) {
      throw new UnauthorizedException('Expired token');
    }

    // Token expired after 1 day
    if ((Date.now() - user.email_change_at.getTime()) / 1000 > this.config.get('user.tokenExpiration.email_confirm')) {
      user.email_confirm = undefined;
      user.email_token = undefined;
      await this.userRepository.update(user);

      throw new ForbiddenException('Expired token');
    }

    user.status = 'active';

    return this.userRepository.update(user);
  }
}
