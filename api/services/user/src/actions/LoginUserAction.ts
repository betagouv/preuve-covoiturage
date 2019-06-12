import { Parents, Container, Types, Exceptions } from '@ilos/core';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

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
  public readonly middlewares: (string | [string, any])[] = [['validate', 'user.login']];

  constructor(
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

      const patchUser = await this.userRepository.patch(user._id, { lastConnectedAt: new Date() });

      // todo: set auth token
      return patchUser;
    } catch (e) {
      throw new Exceptions.ForbiddenException();
    }
  }
}
