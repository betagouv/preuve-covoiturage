import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, UnauthorizedException } from '@ilos/common';

import { configHandler, ParamsInterface, ResultInterface } from '../shared/user/sendInvitationEmail.contract';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/user/sendInvitationEmail.schema';
import { AuthRepositoryProviderInterfaceResolver } from '../interfaces/AuthRepositoryProviderInterface';
import { UserNotificationProvider } from '../providers/UserNotificationProvider';

/*
 * send the confirmation email to a user by _id
 */
@handler(configHandler)
export class SendInvitationEmailUserAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [
    ['validate', alias],
    [
      'scopeIt',
      [
        ['user.send-confirm-email'],
        [
          (_params, context) => {
            if (context.call.user.territory) {
              return 'territory.users.send-confirm-email';
            }
          },
          (_params, context) => {
            if (context.call.user.operator) {
              return 'operator.users.send-confirm-email';
            }
          },
        ],
      ],
    ],
  ];

  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private authProvider: AuthRepositoryProviderInterfaceResolver,
    private notification: UserNotificationProvider,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const scope = context.call.user.territory_id
      ? 'territory'
      : context.call.user.operator_id
      ? 'operator'
      : 'registry';
    let user;

    switch (scope) {
      case 'territory':
        user = await this.userRepository.findByTerritory(params._id, context.call.user.territory_id);
        break;
      case 'operator':
        user = await this.userRepository.findByOperator(params._id, context.call.user.operator_id);
        break;
      case 'registry':
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
