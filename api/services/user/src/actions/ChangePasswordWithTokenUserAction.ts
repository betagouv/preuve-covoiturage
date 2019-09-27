import { Action as AbstractAction } from '@ilos/core';
import { handler, ForbiddenException, UnauthorizedException } from '@ilos/common';
import { CryptoProviderInterfaceResolver } from '@pdc/provider-crypto';
import { UserChangePasswordWithTokenParamsInterface } from '@pdc/provider-schema';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { UserContextInterface } from '../interfaces/UserContextInterfaces';
import { User } from '../entities/User';
import { userWhiteListFilterOutput } from '../config/filterOutput';
import { ForgottenTokenValidatorProviderInterface } from '../interfaces/ForgottenTokenValidatorProviderInterface';

/*
 * Change password using the email and forgotten_token for auth
 */
@handler({
  service: 'user',
  method: 'changePasswordWithToken',
})
export class ChangePasswordWithTokenUserAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [['validate', 'user.changePasswordWithToken']];

  constructor(
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private cryptoProvider: CryptoProviderInterfaceResolver,
    private tokenValidator: ForgottenTokenValidatorProviderInterface,
  ) {
    super();
  }

  public async handle(
    params: UserChangePasswordWithTokenParamsInterface,
    context: UserContextInterface,
  ): Promise<User> {
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
