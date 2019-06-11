import { Parents, Container, Types } from '@pdc/core';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserDbInterface } from '../interfaces/UserInterfaces';

export interface ResetPasswordUserInterface {
  token: string;
  password: string;
}

@Container.handler({
  service: 'user',
  method: 'forgottenPassword',
})
export class ResetPasswordUserAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'user.resetPassword'],
  ];

  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private cryptoProvider: CryptoProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ResetPasswordUserInterface, context: Types.ContextType): Promise<UserDbInterface> {
    const user = await this.userRepository.findUserByParam({ forgottenReset: params.token });
    user.password = await this.cryptoProvider.cryptPassword(params.password);
    return this.userRepository.update(user);
  }
}
