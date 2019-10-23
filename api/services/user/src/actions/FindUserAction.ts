import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { configHandler, ParamsInterface, ResultInterface } from '../shared/user/find.contract';
import { alias } from '../shared/user/find.schema';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { UserContextInterface } from '../shared/user/common/interfaces/UserContextInterfaces';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { userWhiteListFilterOutput } from '../config/filterOutput';

/*
 * Find user by id
 */
@handler(configHandler)
export class FindUserAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [
    ['validate', alias],
    [
      'scopeIt',
      [
        ['user.read'],
        [
          (params, context) => {
            if ('_id' in params && params._id === context.call.user._id) {
              return 'profile.read';
            }
          },
          (params, context) => {
            if (context.call.user.territory) {
              return 'territory.users.read';
            }
          },
          (params, context) => {
            if (context.call.user.operator) {
              return 'operator.users.read';
            }
          },
        ],
      ],
    ],
    ['content.whitelist', userWhiteListFilterOutput],
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

    return this.userRepository.findUser(request._id, contextParam);
  }
}
