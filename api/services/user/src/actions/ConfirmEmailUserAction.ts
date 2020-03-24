import { Action as AbstractAction } from '@ilos/core';
import { handler, UnauthorizedException } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/user/confirmEmail.contract';
import { alias } from '../shared/user/confirmEmail.schema';
import { AuthRepositoryProviderInterfaceResolver } from '../interfaces/AuthRepositoryProviderInterface';

/*
 * Confirm email by getting user from 'confirm' and verifying uncrypted 'token' with crypted 'email_token'
 */
@handler({ ...handlerConfig, middlewares: [['validate', alias]] })
export class ConfirmEmailUserAction extends AbstractAction {
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
