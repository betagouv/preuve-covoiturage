import { sprintf } from 'sprintf-js';
import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, ConfigInterfaceResolver, KernelInterfaceResolver } from '@ilos/common';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { configHandler, ParamsInterface, ResultInterface } from '../shared/user/forgottenPassword.contract';
import { alias } from '../shared/user/forgottenPassword.schema';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { AuthRepositoryProviderInterfaceResolver } from '../interfaces/AuthRepositoryProviderInterface';
import { UserNotificationProvider } from '../providers/UserNotificationProvider';

/*
 * find user by email and send email to set new password
 */
@handler(configHandler)
export class ForgottenPasswordUserAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['validate', alias]];

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

    await this.notification.passwordForgotten(params.email, token);
    return;
  }
}
