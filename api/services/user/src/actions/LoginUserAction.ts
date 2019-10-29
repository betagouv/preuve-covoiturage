import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, UnauthorizedException } from '@ilos/common';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { configHandler, ParamsInterface, ResultInterface } from '../shared/user/login.contract';
import { alias } from '../shared/user/login.schema';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { userWhiteListFilterOutput } from '../config/filterOutput';

/*
 * Authenticate user by email & pwd - else throws forbidden error
 */
@handler(configHandler)
export class LoginUserAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [
    ['validate', alias],
    ['content.whitelist', userWhiteListFilterOutput],
  ];

  constructor(
    private cryptoProvider: CryptoProviderInterfaceResolver,
    private userRepository: UserRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
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
