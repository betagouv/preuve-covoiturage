import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { contentWhitelistMiddleware, copyGroupIdAndApplyGroupPermissionMiddlewares } from '@pdc/providers/middleware';

import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/user/find.contract';
import { alias } from '@shared/user/find.schema';
import { UserContextInterface } from '@shared/user/common/interfaces/UserContextInterfaces';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { userWhiteListFilterOutput } from '../config/filterOutput';

/*
 * Find user by id
 */

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      user: 'common.user.find',
      registry: 'registry.user.find',
      territory: 'territory.user.find',
      operator: 'operator.user.find',
    }),
    contentWhitelistMiddleware(...userWhiteListFilterOutput),
  ],
})
export class FindUserAction extends AbstractAction {
  constructor(private userRepository: UserRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: UserContextInterface): Promise<ResultInterface> {
    const scope = params.territory_id ? 'territory_id' : params.operator_id ? 'operator_id' : 'none';
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
