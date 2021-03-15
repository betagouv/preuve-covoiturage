import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/user/changePasswordWithToken.contract';
import { alias } from '../shared/user/changePasswordWithToken.schema';
import { AuthRepositoryProviderInterfaceResolver } from '../interfaces/AuthRepositoryProviderInterface';
import { challengeTokenMiddleware } from '../middlewares/ChallengeTokenMiddleware';

/*
 * Change password using the email and forgotten_token for auth
 */
@handler({ ...handlerConfig, middlewares: [['validate', alias], challengeTokenMiddleware()] })
export class ChangePasswordWithTokenUserAction extends AbstractAction {
  constructor(private authRepository: AuthRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    await this.authRepository.updatePasswordByEmail(
      params.email,
      params.password,
      this.authRepository.CONFIRMED_STATUS,
    );

    return true;
  }
}
