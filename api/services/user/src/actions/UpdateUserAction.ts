import { Parents, Container } from '@pdc/core';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserInterface } from '../entities/UserInterface';

@Container.handler({
  service: 'user',
  method: 'update',
})
export class UpdateUserAction extends Parents.Action {
  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(request: {user: object}): Promise<void> {
    // middleware : "user.update"

    return this.userRepository.update(request.user);
  }
}
