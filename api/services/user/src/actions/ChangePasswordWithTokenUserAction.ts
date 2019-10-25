import { Action as AbstractAction } from '@ilos/core';
import { handler, UnauthorizedException } from '@ilos/common';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';

import { configHandler, ParamsInterface, ResultInterface } from '../shared/user/changePasswordWithToken.contract';
import { alias } from '../shared/user/changePasswordWithToken.schema';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { ForgottenTokenValidatorProviderInterface } from '../interfaces/ForgottenTokenValidatorProviderInterface';

/*
 * Change password using the email and forgotten_token for auth
 */
@handler(configHandler)
export class ChangePasswordWithTokenUserAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['validate', alias]];

  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private cryptoProvider: CryptoProviderInterfaceResolver,
    private tokenValidator: ForgottenTokenValidatorProviderInterface,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const user = await this.tokenValidator.checkToken(params.email, params.forgotten_token);
    if (this.tokenValidator.isExpired('confirmation', user.forgotten_at)) {
      throw new UnauthorizedException('Expired token');
    }

    // change the password
    const password = await this.cryptoProvider.cryptPassword(params.password);

    return this.userRepository.patch(user._id, {
      password,
      forgotten_token: undefined,
      forgotten_at: undefined,
      status: 'active',
    });
  }
}
