import { Parents, Container } from '@pdc/core';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { User } from '../entities/User';
import { UserDbInterface } from '../interfaces/UserInterfaces';

@Container.handler({
  service: 'user',
  method: 'patch',
})
export class PatchUserAction extends Parents.Action {
  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(request: { id: string, patch: { [prop: string]: string }}): Promise<UserDbInterface> {
    // middleware : "user.update"

    return this.userRepository.patch(request.id, request.patch);
  }
}
