import { Action as AbstractAction } from '@ilos/core';
import { handler, UnauthorizedException } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/user/login.contract';
import { alias } from '../shared/user/login.schema';
import { userWhiteListFilterOutput } from '../config/filterOutput';

import { UserRepositoryProviderInterfaceResolver } from '../interfaces/UserRepositoryProviderInterface';
import { AuthRepositoryProviderInterfaceResolver } from '../interfaces/AuthRepositoryProviderInterface';

/*
 * Authenticate user by email & pwd - else throws forbidden error
 */
@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ['content.whitelist', userWhiteListFilterOutput],
  ],
})
export class LoginUserAction extends AbstractAction {
  constructor(
    private authRepository: AuthRepositoryProviderInterfaceResolver,
    private userRepository: UserRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    if (!(await this.authRepository.challengePasswordByEmail(params.email, params.password))) {
      throw new UnauthorizedException();
    }

    const user = await this.userRepository.findByEmail(params.email);
    switch (user.status) {
      case 'pending':
        throw new UnauthorizedException('Account is pending validation');
      case 'invited':
        throw new UnauthorizedException('Account must be confirmed');
      case 'blocked':
        throw new UnauthorizedException('Account is blocked');
      default:
    }

    // update last_login timestamp
    await this.userRepository.touchLastLogin(user._id);

    return user;
  }
}
