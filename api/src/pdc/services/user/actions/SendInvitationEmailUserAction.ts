import { Action as AbstractAction } from '@ilos/core/index.ts';
import { handler, ContextType, UnauthorizedException } from '@ilos/common/index.ts';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/providers/middleware/index.ts';

import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/user/sendInvitationEmail.contract.ts';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface.ts';
import { alias } from '@shared/user/sendInvitationEmail.schema.ts';
import { AuthRepositoryProviderInterfaceResolver } from '../interfaces/AuthRepositoryProviderInterface.ts';
import { UserNotificationProvider } from '../providers/UserNotificationProvider.ts';
import { UserFindInterface } from '@shared/user/common/interfaces/UserFindInterface.ts';

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
export class SendInvitationEmailUserAction extends AbstractAction {
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
      this.authProvider.INVITATION_TOKEN,
      this.authProvider.INVITED_STATUS,
    );

    await this.notification.invite(token, user.email, `${user.firstname} ${user.lastname}`);
    return true;
  }
}
