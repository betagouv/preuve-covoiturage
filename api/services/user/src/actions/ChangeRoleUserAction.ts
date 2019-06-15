import { Parents, Container, Interfaces, Types } from '@ilos/core';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { User } from '../entities/User';
import { UserChangeRoleParamsInterface } from '../interfaces/actions/UserChangeRoleParamsInterface';
import {userWhiteListFilterOutput} from "../config/filterOutput";

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
          (params, context) => {
            if ('id' in params && params.id === context.call.user._id) {
              return 'profile.update';
            }
          },
          (_params, context) => {
            if ('aom' in context.call.user) {
              return 'aom.users.update';
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
    ['filterOutput', { whiteList: userWhiteListFilterOutput }],
  ];
  constructor(
    private kernel: Interfaces.KernelInterfaceResolver,
    private userRepository: UserRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: UserChangeRoleParamsInterface, context: Types.ContextType): Promise<User> {
    const contextParam: { aom?: string; operator?: string } = {};

    if ('aom' in context.call.user) {
      contextParam.aom = context.call.user.aom;
    }

    if ('operator' in context.call.user) {
      contextParam.operator = context.call.user.operator;
    }

    return this.userRepository.patchUser(params.id, { role: params.role }, contextParam);
  }
}
