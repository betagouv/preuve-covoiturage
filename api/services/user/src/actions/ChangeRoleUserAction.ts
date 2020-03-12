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
    [
      'scopeIt',
      [
        ['user.update'],
        [
          (_params, context): string => {
            if (context.call.user.territory_id) {
              return 'territory.users.update';
            }
          },
          (_params, context): string => {
            if (context.call.user.operator_id) {
              return 'operator.users.update';
            }
          },
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
    const scope = context.call.user.territory_id
      ? 'territory'
      : context.call.user.operator_id
      ? 'operator'
      : 'registry';
    switch (scope) {
      case 'territory':
        await this.userRepository.patchByTerritory(params._id, { role: params.role }, context.call.user.territory_id);
        break;
      case 'operator':
        await this.userRepository.patchByOperator(params._id, { role: params.role }, context.call.user.operator_id);
        break;
      case 'registry':
        await this.userRepository.patch(params._id, { role: params.role });
        break;
    }

    return true;
  }
}
