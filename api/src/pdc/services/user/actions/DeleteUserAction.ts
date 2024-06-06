import { Action as AbstractAction } from '@/ilos/core/index.ts';
import { handler } from '@/ilos/common/index.ts';
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from '@/pdc/providers/middleware/index.ts';

import { handlerConfig, ParamsInterface, ResultInterface } from '@/shared/user/delete.contract.ts';
import { alias } from '@/shared/user/delete.schema.ts';
import { UserContextInterface } from '@/shared/user/common/interfaces/UserContextInterfaces.ts';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface.ts';

/*
 *  Find user by id and delete user
 */
@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      registry: 'registry.user.delete',
      territory: 'territory.user.delete',
      operator: 'operator.user.delete',
    }),
  ],
})
export class DeleteUserAction extends AbstractAction {
  constructor(private userRepository: UserRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: UserContextInterface): Promise<ResultInterface> {
    const scope = params.territory_id ? 'territory_id' : params.operator_id ? 'operator_id' : 'none';
    switch (scope) {
      case 'territory_id':
        return this.userRepository.deleteByTerritory(params._id, params[scope]);
      case 'operator_id':
        return this.userRepository.deleteByOperator(params._id, params[scope]);
      case 'none':
        return this.userRepository.delete(params._id);
      default:
        return false;
    }
  }
}
