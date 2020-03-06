import { Action as AbstractAction } from '@ilos/core';
import { handler, UnauthorizedException } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/user/changePasswordWithToken.contract';
import { alias } from '../shared/user/changePasswordWithToken.schema';
import { AuthRepositoryProviderInterfaceResolver } from '../interfaces/AuthRepositoryProviderInterface';

/*
 * Change password using the email and forgotten_token for auth
 */
@handler({ ...handlerConfig, middlewares: [['validate', alias]] })
export class ChangePasswordWithTokenUserAction extends AbstractAction {
  constructor(private authRepository: AuthRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    if (!(await this.authRepository.challengeTokenByEmail(params.email, params.token))) {
      throw new UnauthorizedException('Wrong token');
    }

    await this.authRepository.updatePasswordByEmail(
      params.email,
      params.password,
      this.authRepository.CONFIRMED_STATUS,
    );

    return true;
  }
}
