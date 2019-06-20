import { Parents, Container } from '@ilos/core';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { UserContextInterface } from '../interfaces/UserContextInterfaces';
import { User } from '../entities/User';
import { userWhiteListFilterOutput } from '../config/filterOutput';

/*
 * Find user by id
 */
@Container.handler({
  service: 'user',
  method: 'find',
})
export class FindUserAction extends Parents.Action {
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
            if ('territory' in context.call.user) {
              return 'territory.users.read';
            }
          },
          (params, context) => {
            if ('operator' in context.call.user) {
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

    if ('territory' in context.call.user) {
      contextParam.territory = context.call.user.territory;
    }

    if ('operator' in context.call.user) {
      contextParam.operator = context.call.user.operator;
    }

    return this.userRepository.findUser(request._id, contextParam);
  }
}
