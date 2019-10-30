import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, ConflictException, UnauthorizedException } from '@ilos/common';

import { configHandler, ParamsInterface, ResultInterface } from '../shared/user/patch.contract';
import { alias } from '../shared/user/patch.schema';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { userWhiteListFilterOutput } from '../config/filterOutput';
import { UserNotificationProvider } from '../providers/UserNotificationProvider';
import { AuthRepositoryProviderInterfaceResolver } from '../interfaces/AuthRepositoryProviderInterface';

/*
 * Update properties of user ( firstname, lastname, phone )
 * The user is switched to 'pending' when the email is modified.
 * A confirmation link is sent to the new email and a notification to the old one.
 */
@handler(configHandler)
export class PatchUserAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [
    ['validate', alias],
    [
      'scopeIt',
      [
        ['user.update'],
        [
          (params, context) => {
            if ('_id' in params && params._id === context.call.user._id) {
              return 'profile.update';
            }
          },
          (_params, context) => {
            if (context.call.user.territory) {
              return 'territory.users.update';
            }
          },
          (_params, context) => {
            if (context.call.user.operator) {
              return 'operator.users.update';
            }
          },
        ],
      ],
    ],
    ['content.whitelist', userWhiteListFilterOutput],
  ];
  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private notification: UserNotificationProvider,
    private authRepository: AuthRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const scope = context.call.user.territory_id
      ? 'territory'
      : context.call.user.operator_id
      ? 'operator'
      : 'registry';
    const id = params._id;
    const { email, ...patch } = params.patch;

    let user;

    switch (scope) {
      case 'territory':
        user = await this.userRepository.findByTerritory(id, context.call.user.territory_id);
        break;
      case 'operator':
        user = await this.userRepository.findByOperator(id, context.call.user.operator_id);
        break;
      case 'registry':
        user = await this.userRepository.find(id);
        break;
    }

    if (!user) {
      throw new UnauthorizedException();
    }

    const updatedUser = await this.userRepository.patch(id, patch);

    if (!email) {
      return updatedUser;
    }

    try {
      const token = await this.authRepository.updateEmailById(id, email);
      await this.notification.emailUpdated(token, email, user.email);
      return {
        ...updatedUser,
        email,
      };
    } catch (e) {
      switch (e.code) {
        case 11000:
          throw new ConflictException();
        default:
          throw e;
      }
    }
  }
}
