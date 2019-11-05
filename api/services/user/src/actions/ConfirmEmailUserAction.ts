import { Action as AbstractAction } from '@ilos/core';
import { handler, UnauthorizedException } from '@ilos/common';

import { configHandler, ParamsInterface, ResultInterface } from '../shared/user/confirmEmail.contract';
import { alias } from '../shared/user/confirmEmail.schema';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { AuthRepositoryProviderInterfaceResolver } from '../interfaces/AuthRepositoryProviderInterface';

/*
 * Confirm email by getting user from 'confirm' and verifying uncrypted 'token' with crypted 'email_token'
 */
@handler(configHandler)
export class ConfirmEmailUserAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['validate', alias]];

  constructor(private authRepository: AuthRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    if (!(await this.authRepository.challengeTokenByEmail(params.email, params.token))) {
      throw new UnauthorizedException('Wrong token');
    }

    await this.authRepository.clearTokenByEmail(params.email, this.authRepository.CONFIRMED_STATUS);

    return true;
  }
}
