import { Parents, Container } from '@pdc/core';
import { UserRepositoryProvider } from '../providers/UserRepositoryProvider';

@Container.handler({
  service: 'user',
  method: 'find',
})
export class FindUserAction extends Parents.Action {
  constructor(
    private userRepository: UserRepositoryProvider,
  ) {
    super();
  }

  public async handle(request: {id: string}): Promise<void> {
    return this.userRepository.find(request.id);
  }
}
