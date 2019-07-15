import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, ConfigInterfaceResolver, ForbiddenException } from '@ilos/common';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { User } from '../entities/User';
import { UserLoginParamsInterface } from '../interfaces/actions/UserLoginParamsInterface';
import { userWhiteListFilterOutput } from '../config/filterOutput';

/*
 * Authenticate user by email & pwd - else throws forbidden error
 */
@handler({
  service: 'user',
  method: 'login',
})
export class LoginUserAction extends AbstractAction {
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

  public async handle(params: UserLoginParamsInterface, context: ContextType): Promise<User> {
    try {
      const user = await this.userRepository.findUserByParams({ email: params.email });

      if (!(await this.cryptoProvider.comparePassword(params.password, user.password))) {
        throw new ForbiddenException();
      }

      if (user.status !== this.config.get('user.status.active')) {
        throw new ForbiddenException();
      }

      return this.userRepository.patch(user._id, { lastConnectedAt: new Date() });
    } catch (e) {
      throw new ForbiddenException();
    }
  }
}
