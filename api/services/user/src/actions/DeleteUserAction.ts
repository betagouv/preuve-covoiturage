import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { configHandler, ParamsInterface, ResultInterface } from '../shared/user/delete.contract';
import { alias } from '../shared/user/delete.schema';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { UserContextInterface } from '../shared/user/common/interfaces/UserContextInterfaces';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';

/*
 *  Find user by id and delete user
 */
@handler(configHandler)
export class DeleteUserAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [
    ['validate', alias],
    [
      'scopeIt',
      [
        ['user.delete'],
        [
          (params, context) => {
            if ('_id' in params && params._id === context.call.user._id) {
              return 'profile.delete';
            }
          },
          (_params, context) => {
            if (context.call.user.territory) {
              return 'territory.users.remove';
            }
          },
          (_params, context) => {
            if (context.call.user.operator) {
              return 'operator.users.remove';
            }
          },
        ],
      ],
    ],
  ];

  constructor(private userRepository: UserRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(request: ParamsInterface, context: UserContextInterface): Promise<ResultInterface> {
    const contextParam: { territory?: string; operator?: string } = {};

    if (context.call.user.territory) {
      contextParam.territory = context.call.user.territory;
    }

    if (context.call.user.operator) {
      contextParam.operator = context.call.user.operator;
    }

    await this.userRepository.deleteUser(request._id, contextParam);
  }
}
