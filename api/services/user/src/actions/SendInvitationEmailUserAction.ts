import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, UnauthorizedException } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/user/sendInvitationEmail.contract';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { alias } from '../shared/user/sendInvitationEmail.schema';
import { AuthRepositoryProviderInterfaceResolver } from '../interfaces/AuthRepositoryProviderInterface';
import { UserNotificationProvider } from '../providers/UserNotificationProvider';
import { UserFindInterface } from '../shared/user/common/interfaces/UserFindInterface';

/*
 * send the confirmation email to a user by _id
 */
@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ['copy_from_context', ['call.user.territory_id', 'territory_id']],
    ['copy_from_context', ['call.user.operator_id', 'operator_id']],
    [
      'has_permission_by_scope',
      [
        'user.send-confirm-email',
        [
          [
            'territory.users.send-confirm-email',
            'call.user.territory_id',
            'territory_id',
          ],
          [
            'operator.users.send-confirm-email',
            'call.user.operator_id',
            'operator_id',
          ],
        ],
      ],
    ],
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
    const scope = params.territory_id
    ? 'territory_id'
    : params.operator_id
    ? 'operator_id'
    : 'none';
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

    await this.notification.userCreated(token, user.email);
    return true;
  }
}
