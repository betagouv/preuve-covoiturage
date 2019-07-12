import { Parents, Container, Types, Exceptions } from '@ilos/core';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { ConfigInterfaceResolver } from '@ilos/config';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/repository/UserRepositoryProviderInterface';
import { UserLoginParamsInterface } from '../interfaces/actions/UserLoginParamsInterface';

import { User } from '../entities/User';

import { userWhiteListFilterOutput } from '../config/filterOutput';

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
    ['content.whitelist', userWhiteListFilterOutput],
  ];

  constructor(
    private config: ConfigInterfaceResolver,
    private cryptoProvider: CryptoProviderInterfaceResolver,
    private userRepository: UserRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: UserLoginParamsInterface, context: Types.ContextType): Promise<User> {
    try {
      const user = await this.userRepository.findByEmail(params.email);

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
