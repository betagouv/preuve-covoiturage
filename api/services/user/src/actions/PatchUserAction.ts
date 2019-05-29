import { Parents, Container } from '@pdc/core';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserDbInterface } from '../interfaces/UserInterfaces';

@Container.handler({
  service: 'user',
  method: 'patch',
})
export class PatchUserAction extends Parents.Action {
  public readonly middlewares: (string|[string, any])[] = [
    ['can', ['user.update']], // profile.update
    ['validate', 'user.patch'],
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
