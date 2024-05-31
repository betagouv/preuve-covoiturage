import { Action as AbstractAction } from '@ilos/core/index.ts';
import { handler } from '@ilos/common/index.ts';

import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/user/changePasswordWithToken.contract.ts';
import { alias } from '@shared/user/changePasswordWithToken.schema.ts';
import { AuthRepositoryProviderInterfaceResolver } from '../interfaces/AuthRepositoryProviderInterface.ts';
import { challengeTokenMiddleware } from '../middlewares/ChallengeTokenMiddleware.ts';

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
