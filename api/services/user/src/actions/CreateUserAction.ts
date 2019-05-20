import { Parents, Container } from '@pdc/core';
import { UserRepositoryProvider } from '../providers/UserRepositoryProvider';

@Container.handler({
  service: 'user',
  method: 'find',
})
export class CreateUserAction extends Parents.Action {
  constructor(
    private userRepository: UserRepositoryProvider,
  ) {
    super();
  }

  protected async handle(request: {id: string}): Promise<void> {
    return this.userRepository.find(request.id);
  }
}
