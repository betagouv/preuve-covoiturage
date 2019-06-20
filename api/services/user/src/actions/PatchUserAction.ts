import { Parents, Container, Types } from '@ilos/core';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserPatchParamsInterface } from '../interfaces/actions/UserPatchParamsInterface';

import { User } from '../entities/User';
import { userWhiteListFilterOutput } from '../config/filterOutput';

/*
 * Update properties of user ( firstname, lastname, phone )
 */
@Container.handler({
  service: 'user',
  method: 'patch',
})
export class PatchUserAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'user.patch'],
    [
      'scopeIt',
      [
        ['user.update'],
        [
          (params, context) => {
            if ('_id' in params && params._id === context.call.user._id) {
              return 'profile.update';
            }
          },
          (_params, context) => {
            if ('territory' in context.call.user) {
              return 'territory.users.update';
            }
          },
          (_params, context) => {
            if ('operator' in context.call.user) {
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

  public async handle(params: UserPatchParamsInterface, context: Types.ContextType): Promise<User> {
    const contextParam: { territory?: string; operator?: string } = {};

    if ('territory' in context.call.user) {
      contextParam.territory = context.call.user.territory;
    }

    if ('operator' in context.call.user) {
      contextParam.operator = context.call.user.operator;
    }

    return this.userRepository.patchUser(params._id, params.patch, contextParam);
  }
}
