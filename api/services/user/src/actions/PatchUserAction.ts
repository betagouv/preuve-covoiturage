import { Parents, Container } from '@pdc/core';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { User } from '../entities/User';

@Container.handler({
  service: 'user',
  method: 'update',
})
export class PatchUserAction extends Parents.Action {
  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(request: { id: string, patch: { [prop: string]: string }}): Promise<User> {
    // middleware : "user.update"

    return this.userRepository.patch(request.id, request.patch);
  }
}
