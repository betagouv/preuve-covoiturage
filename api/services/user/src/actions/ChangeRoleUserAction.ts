import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';

import { configHandler, ParamsInterface, ResultInterface } from '../shared/user/changeRole.contract';
import { alias } from '../shared/user/changeRole.schema';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { userWhiteListFilterOutput } from '../config/filterOutput';

/*
 * Update role of user
 */
@handler(configHandler)
export class ChangeRoleUserAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [
    ['validate', alias],
    [
      'scopeIt',
      [
        ['user.update'],
        [
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
  constructor(private userRepository: UserRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const contextParam: { territory?: string; operator?: string } = {};

    if (context.call.user.territory) {
      contextParam.territory = context.call.user.territory;
    }

    if (context.call.user.operator) {
      contextParam.operator = context.call.user.operator;
    }

    return this.userRepository.patchUser(params._id, { role: params.role }, contextParam);
  }
}
