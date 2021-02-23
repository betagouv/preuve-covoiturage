import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/user/changeRole.contract';
import { alias } from '../shared/user/changeRole.schema';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';

/*
 * Update role of user
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
        'user.update',
        [
          [
            'territory.users.update',
            'call.user.territory_id',
            'territory_id',
          ],
          [
            'operator.users.update',
            'call.user.operator_id',
            'operator_id'
          ],
        ],
      ],
    ],
  ],
})
export class ChangeRoleUserAction extends AbstractAction {
  constructor(private userRepository: UserRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const scope = params.territory_id
      ? 'territory_id'
      : params.operator_id
      ? 'operator_id'
      : 'none';
    switch (scope) {
      case 'territory_id':
        await this.userRepository.patchByTerritory(params._id, { role: params.role }, params[scope]);
        break;
      case 'operator_id':
        await this.userRepository.patchByOperator(params._id, { role: params.role }, params[scope]);
        break;
      case 'none':
        await this.userRepository.patch(params._id, { role: params.role });
        break;
    }

    return true;
  }
}
