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
    ['copy_from_context', ['call.user.territory_id', 'territory_id']],
    ['copy_from_context', ['call.user.operator_id', 'operator_id']],
    [
      'has_permission_by_scope',
      [
        'user.delete',
        [
          [
            'profile.delete',
            'call.user._id',
            '_id',
          ],
          [
            'territory.users.remove',
            'call.user.territory_id',
            'territory_id',
          ],
          [
            'operator.users.remove',
            'call.user.operator_id',
            'operator_id',
          ],
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
    const scope = params.territory_id
    ? 'territory_id'
    : params.operator_id
    ? 'operator_id'
    : 'none';
    switch (scope) {
      case 'territory_id':
        await this.userRepository.deleteByTerritory(params._id, params[scope]);
        break;
      case 'operator_id':
        await this.userRepository.deleteByOperator(params._id, params[scope]);
        break;
      case 'none':
        await this.userRepository.delete(params._id);
        break;
    }

    return true;
  }
}
