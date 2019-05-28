import { Parents, Container } from '@pdc/core';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserDbInterface } from '../interfaces/UserInterfaces';

@Container.handler({
  service: 'user',
  method: 'delete',
})
export class DeleteUserAction extends Parents.Action {
  public readonly middlewares: (string|[string, any])[] = [
    ['can', ['user.delete']], // 'profile.delete'
    ['validate', 'user.delete'],
  ];

  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(request: {id: string}): Promise<void> {
    return this.userRepository.delete(request.id);
  }
}
