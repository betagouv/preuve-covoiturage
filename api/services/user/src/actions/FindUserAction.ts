import { Parents, Container, Types } from '@ilos/core';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserContextInterface } from '../interfaces/UserContextInterfaces';
import { User } from '../entities/User';

@Container.handler({
  service: 'user',
  method: 'find',
})
export class FindUserAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'user.find'],
    ['filterOutput', 'password'],
    [
      'scopeIt',
      [
        ['user.read'],
        [
          (params, context) => {
            if ('id' in params && params.id === context.call.user._id) {
              return 'profile.read';
            }
          },
          (params, context) => {
            if ('aom' in context.call.user) {
              return 'aom.users.read';
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
    ['filterOutput', 'password'],
  ];
  constructor(private userRepository: UserRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(request: { id: string }, context: UserContextInterface): Promise<User> {
    const contextParam: { aom?: string; operator?: string } = {};

    if ('aom' in context.call.user) {
      contextParam.aom = context.call.user.aom;
    }

    if ('operator' in context.call.user) {
      contextParam.operator = context.call.user.operator;
    }

    return this.userRepository.findUser(request.id, contextParam);
  }
}
