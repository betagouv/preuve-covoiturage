import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/user/delete.contract';
import { alias } from '../shared/user/delete.schema';
import { UserContextInterface } from '../shared/user/common/interfaces/UserContextInterfaces';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';

/*
 *  Find user by id and delete user
 */
@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    [
      'scope_it',
      [
        ['user.delete'],
        [
          (params, context): string => {
            if ('_id' in params && params._id === context.call.user._id) {
              return 'profile.delete';
            }
          },
          (_params, context): string => {
            if (context.call.user.territory_id) {
              return 'territory.users.remove';
            }
          },
          (_params, context): string => {
            if (context.call.user.operator_id) {
              return 'operator.users.remove';
            }
          },
        ],
      ],
    ],
  ],
})
export class DeleteUserAction extends AbstractAction {
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
        await this.userRepository.deleteByTerritory(params._id, context.call.user.territory_id);
        break;
      case 'operator':
        await this.userRepository.deleteByOperator(params._id, context.call.user.operator_id);
        break;
      case 'registry':
        await this.userRepository.delete(params._id);
        break;
    }

    return true;
  }
}
