import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/user/confirmEmail.contract';
import { alias } from '../shared/user/confirmEmail.schema';
import { AuthRepositoryProviderInterfaceResolver } from '../interfaces/AuthRepositoryProviderInterface';
import { challengeTokenMiddleware } from '../middlewares/ChallengeTokenMiddleware';

/*
 * Confirm email by getting user from 'confirm' and verifying uncrypted 'token' with crypted 'email_token'
 */
@handler({ ...handlerConfig, middlewares: [['validate', alias], challengeTokenMiddleware()] })
export class ConfirmEmailUserAction extends AbstractAction {
  constructor(private authRepository: AuthRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    await this.authRepository.clearTokenByEmail(params.email, this.authRepository.CONFIRMED_STATUS);

    return true;
  }
}
