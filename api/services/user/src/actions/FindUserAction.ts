import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/user/find.contract';
import { alias } from '../shared/user/find.schema';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { UserContextInterface } from '../shared/user/common/interfaces/UserContextInterfaces';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { userWhiteListFilterOutput } from '../config/filterOutput';

/*
 * Find user by id
 */
@handler(handlerConfig)
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
            if (context.call.user.territory_id) {
              return 'territory.users.read';
            }
          },
          (params, context) => {
            if (context.call.user.operator_id) {
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

  public async handle(params: ParamsInterface, context: UserContextInterface): Promise<ResultInterface> {
    const scope = context.call.user.territory_id
      ? 'territory'
      : context.call.user.operator_id
      ? 'operator'
      : 'registry';
    switch (scope) {
      case 'territory':
        return this.userRepository.findByTerritory(params._id, context.call.user.territory_id);
      case 'operator':
        return this.userRepository.findByOperator(params._id, context.call.user.operator_id);
      case 'registry':
        return this.userRepository.find(params._id);
    }
  }
}
