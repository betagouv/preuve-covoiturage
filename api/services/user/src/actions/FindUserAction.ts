import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserContextInterface } from '../interfaces/UserContextInterfaces';
import { User } from '../entities/User';
import { userWhiteListFilterOutput } from '../config/filterOutput';

/*
 * Find user by id
 */
@handler({
  service: 'user',
  method: 'find',
})
export class FindUserAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'user.find'],
    [
      'scopeIt',
      [
        ['user.read'],
        [
          (params, context) => {
            if ('_id' in params && params._id === context.call.user._id) {
              return 'profile.read';
            }
          },
          (params, context) => {
            if (context.call.user.territory) {
              return 'territory.users.read';
            }
          },
          (params, context) => {
            if (context.call.user.operator) {
              return 'operator.users.read';
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

  public async handle(request: { _id: string }, context: UserContextInterface): Promise<User> {
    const contextParam: { territory?: string; operator?: string } = {};

    if (context.call.user.territory) {
      contextParam.territory = context.call.user.territory;
    }

    if (context.call.user.operator) {
      contextParam.operator = context.call.user.operator;
    }

    return this.userRepository.findUser(request._id, contextParam);
  }
}
