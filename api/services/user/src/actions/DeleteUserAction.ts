import { Parents, Container } from '@ilos/core';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { UserContextInterface } from '../interfaces/UserContextInterfaces';

/*
 *  Find user by id and delete user
 */
@Container.handler({
  service: 'user',
  method: 'delete',
})
export class DeleteUserAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'user.delete'],
    [
      'scopeIt',
      [
        ['user.delete'],
        [
          (params, context) => {
            if ('_id' in params && params._id === context.call.user._id) {
              return 'profile.delete';
            }
          },
          (_params, context) => {
            if (context.call.user.territory) {
              return 'territory.users.remove';
            }
          },
          (_params, context) => {
            if (context.call.user.operator) {
              return 'operator.users.remove';
            }
          },
        ],
      ],
    ],
  ];

  constructor(private userRepository: UserRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(request: { _id: string }, context: UserContextInterface): Promise<void> {
    const contextParam: { territory?: string; operator?: string } = {};

    if (context.call.user.territory) {
      contextParam.territory = context.call.user.territory;
    }

    if (context.call.user.operator) {
      contextParam.operator = context.call.user.operator;
    }

    return this.userRepository.deleteUser(request._id, contextParam);
  }
}
