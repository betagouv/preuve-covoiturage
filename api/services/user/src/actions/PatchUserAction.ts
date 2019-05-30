import { Parents, Container } from '@pdc/core';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserDbInterface } from '../interfaces/UserInterfaces';

@Container.handler({
  service: 'user',
  method: 'patch',
})
export class PatchUserAction extends Parents.Action {
  public readonly middlewares: (string|[string, any])[] = [
    ['validate', 'user.patch'],
    ['scopeIt', [['user.update'], [
      (params, context) => {
        if ('id' in params && params.id === context.call.user._id) {
          return 'profile.update';
        }
      },
      (params, context) => {
        if ('aom' in params && params.aom === context.call.user.aom) {
          return 'aom.users.update';
        }
      },
      (params, context) => {
        if ('operator' in params && params.operator === context.call.user.operator) {
          return 'operator.users.update';
        }
      },
    ]]],
  ];
  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(request: { id: string, patch: { [prop: string]: string }}): Promise<UserDbInterface> {
    return this.userRepository.patch(request.id, request.patch);
  }
}
