import { Parents, Container } from '@pdc/core';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';

@Container.handler({
  service: 'user',
  method: 'delete',
})
export class DeleteUserAction extends Parents.Action {
  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(request: {id: string}): Promise<void> {
    return this.userRepository.delete(request.id);
  }
}
