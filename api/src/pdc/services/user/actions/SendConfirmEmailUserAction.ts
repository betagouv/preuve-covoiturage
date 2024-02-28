import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, UnauthorizedException } from '@ilos/common';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/providers/middleware';

import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/user/sendConfirmEmail.contract';
import { alias } from '@shared/user/sendConfirmEmail.schema';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { AuthRepositoryProviderInterfaceResolver } from '../interfaces/AuthRepositoryProviderInterface';
import { UserNotificationProvider } from '../providers/UserNotificationProvider';
import { UserFindInterface } from '@shared/user/common/interfaces/UserFindInterface';

/*
 * send the confirmation email to a user by _id
 */
@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      registry: 'registry.user.sendEmail',
      territory: 'territory.user.sendEmail',
      operator: 'operator.user.sendEmail',
    }),
  ],
})
export class SendConfirmEmailUserAction extends AbstractAction {
  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private authProvider: AuthRepositoryProviderInterfaceResolver,
    private notification: UserNotificationProvider,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const scope = params.territory_id ? 'territory_id' : params.operator_id ? 'operator_id' : 'none';

    let user: UserFindInterface;

    switch (scope) {
      case 'territory_id':
        user = await this.userRepository.findByTerritory(params._id, params[scope]);
        break;
      case 'operator_id':
        user = await this.userRepository.findByOperator(params._id, params[scope]);
        break;
      case 'none':
        user = await this.userRepository.find(params._id);
        break;
    }

    if (!user) {
      throw new UnauthorizedException();
    }

    const token = await this.authProvider.createTokenByEmail(
      user.email,
      this.authProvider.CONFIRMATION_TOKEN,
      this.authProvider.UNCONFIRMED_STATUS,
    );

    await this.notification.confirmEmail(token, user.email, `${user.firstname} ${user.lastname}`);
    return true;
  }
}
