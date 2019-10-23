import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, UnauthorizedException } from '@ilos/common';

import { configHandler, ParamsInterface, ResultInterface } from '../shared/user/confirmEmail.contract';
import { alias } from '../shared/user/confirmEmail.schema';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { ForgottenTokenValidatorProviderInterface } from '../interfaces/ForgottenTokenValidatorProviderInterface';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { userWhiteListFilterOutput } from '../config/filterOutput';

/*
 * Confirm email by getting user from 'confirm' and verifying uncrypted 'token' with crypted 'email_token'
 */
@handler(configHandler)
export class ConfirmEmailUserAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [
    ['validate', alias],
    ['content.whitelist', userWhiteListFilterOutput],
  ];

  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private tokenValidator: ForgottenTokenValidatorProviderInterface,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const user = await this.tokenValidator.checkToken(params.email, params.forgotten_token);
    if (this.tokenValidator.isExpired('confirmation', user.forgotten_at)) {
      throw new UnauthorizedException('Expired token');
    }

    // user is confirmed, switch the status to active
    return this.userRepository.update({
      ...user,
      status: 'active',
      forgotten_at: undefined,
      forgotten_token: undefined,
    });
  }
}
