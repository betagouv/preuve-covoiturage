import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/user/find.contract';
import { alias } from '../shared/user/find.schema';
import { UserContextInterface } from '../shared/user/common/interfaces/UserContextInterfaces';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { userWhiteListFilterOutput } from '../config/filterOutput';

/*
 * Find user by id
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
        'user.read',
        [
          [
            'profile.read',
            'call.user._id',
            '_id',
          ],
          [
            'territory.users.read',
            'call.user.territory_id',
            'territory_id',
          ],
          [
            'operator.users.read',
            'call.user.operator_id',
            'operator_id',
          ],
        ],
      ],
    ],
    ['content.whitelist', userWhiteListFilterOutput],
  ],
})
export class FindUserAction extends AbstractAction {
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
        return this.userRepository.findByTerritory(params._id, params[scope]);
      case 'operator_id':
        return this.userRepository.findByOperator(params._id, params[scope]);
      case 'none':
        return this.userRepository.find(params._id);
    }
  }
}
