import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/user/forgottenPassword.contract';
import { alias } from '../shared/user/forgottenPassword.schema';
import { AuthRepositoryProviderInterfaceResolver } from '../interfaces/AuthRepositoryProviderInterface';
import { UserNotificationProvider } from '../providers/UserNotificationProvider';

/*
 * find user by email and send email to set new password
 */
@handler({ ...handlerConfig, middlewares: [['validate', alias]] })
export class ForgottenPasswordUserAction extends AbstractAction {
  constructor(
    private authRepository: AuthRepositoryProviderInterfaceResolver,
    private notification: UserNotificationProvider,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const token = await this.authRepository.createTokenByEmail(
      params.email,
      this.authRepository.RESET_TOKEN,
      this.authRepository.UNCONFIRMED_STATUS,
    );

    await this.notification.passwordForgotten(token, params.email);
    return;
  }
}
