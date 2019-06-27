import { Parents, Container, Types } from '@ilos/core';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { User } from '../entities/User';
import { UserChangeRoleParamsInterface } from '../interfaces/actions/UserChangeRoleParamsInterface';
import { userWhiteListFilterOutput } from '../config/filterOutput';

/*
 * Update role of user
 */
@Container.handler({
  service: 'user',
  method: 'changeRole',
})
export class ChangeRoleUserAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'user.changeRole'],
    [
      'scopeIt',
      [
        ['user.update'],
        [
          (_params, context) => {
            if (!!context.call.user.territory) {
              return 'territory.users.update';
            }
          },
          (_params, context) => {
            if (!!context.call.user.operator) {
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

  public async handle(params: UserChangeRoleParamsInterface, context: Types.ContextType): Promise<User> {
    const contextParam: { territory?: string; operator?: string } = {};

    if (!!context.call.user.territory) {
      contextParam.territory = context.call.user.territory;
    }

    if (!!context.call.user.operator) {
      contextParam.operator = context.call.user.operator;
    }

    return this.userRepository.patchUser(params._id, { role: params.role }, contextParam);
  }
}
