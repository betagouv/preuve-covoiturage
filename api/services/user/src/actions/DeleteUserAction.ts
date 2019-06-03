import { Parents, Container, Types} from '@pdc/core';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserDbInterface } from '../interfaces/UserInterfaces';

@Container.handler({
  service: 'user',
  method: 'delete',
})
export class DeleteUserAction extends Parents.Action {
  public readonly middlewares: (string|[string, any])[] = [
    ['validate', 'user.delete'],
    ['scopeIt', [['user.delete'], [
      (params, context) => {
        if ('id' in params && params.id === context.call.user._id) {
          return 'profile.delete';
        }
      },
      (params, context) => {
        if ('aom' in context.call.user) {
          return 'aom.users.remove';
        }
      },
      (params, context) => {
        if ('operator' in context.call.user) {
          return 'operator.users.remove';
        }
      },
    ]]],
  ];

  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(request: {id: string}, context: Types.ContextType): Promise<void> {
    const contextParam: {aom?: string, operator?: string} = {};

    if ('aom' in context.call.user) {
      contextParam.aom = context.call.user.aom;
    }


    if ('operator' in context.call.user) {
      contextParam.operator = context.call.user.operator;
    }


    return this.userRepository.deleteUser(request.id, contextParam);
  }
}
