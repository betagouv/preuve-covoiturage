import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, ConfigInterfaceResolver, UnauthorizedException } from '@ilos/common';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { UserLoginParamsInterface } from '@pdc/provider-schema';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { User } from '../entities/User';
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
    let user;

    // cast any user error to 401 Unauthorized
    // as the findUserByParams will leak existing / not found users with a 404
    try {
      user = await this.userRepository.findUserByParams({ email: params.email });
    } catch (e) {
      throw new UnauthorizedException();
    }

    if (!(await this.cryptoProvider.comparePassword(params.password, user.password))) {
      throw new UnauthorizedException();
    }

    switch (user.status) {
      case 'pending':
        throw new UnauthorizedException('Account is pending validation');
      case 'invited':
        throw new UnauthorizedException('Account must be confirmed');
      case 'blocked':
        throw new UnauthorizedException('Account is blocked');
      default:
    }

    return this.userRepository.patch(user._id, {
      forgotten_at: null,
      forgotten_token: null,
      last_connected_at: new Date(),
    });
  }
}
