import { Parents, Container, Types, Exceptions } from '@ilos/core';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { User } from '../entities/User';
import { UserLoginParamsInterface } from '../interfaces/UserLoginParamsInterface';

/*
 * Authenticate user by email & pwd - else throws forbidden error
 */
@Container.handler({
  service: 'user',
  method: 'login',
})
export class LoginUserAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'user.login'],
    ['filterOutput', ['password']],
  ];

  constructor(
    private config: ConfigProviderInterfaceResolver,
    private cryptoProvider: CryptoProviderInterfaceResolver,
    private userRepository: UserRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: UserLoginParamsInterface, context: Types.ContextType): Promise<User> {
    try {
      const user = await this.userRepository.findUserByParams({ email: params.email });

      if (!(await this.cryptoProvider.comparePassword(params.password, user.password))) {
        throw new Exceptions.ForbiddenException();
      }

      if (user.status !== this.config.get('user.status.active')) {
        throw new Exceptions.ForbiddenException();
      }

      return this.userRepository.patch(user._id, { lastConnectedAt: new Date() });
    } catch (e) {
      throw new Exceptions.ForbiddenException();
    }
  }
}
