import { Action as AbstractAction } from '@/ilos/core/index.ts';
import { handler } from '@/ilos/common/index.ts';

import { handlerConfig, ParamsInterface, ResultInterface } from '@/shared/user/confirmEmail.contract.ts';
import { alias } from '@/shared/user/confirmEmail.schema.ts';
import { AuthRepositoryProviderInterfaceResolver } from '../interfaces/AuthRepositoryProviderInterface.ts';
import { challengeTokenMiddleware } from '../middlewares/ChallengeTokenMiddleware.ts';

/*
 * Confirm email by getting user from 'confirm' and verifying uncrypted 'token' with crypted 'email_token'
 */
@handler({ ...handlerConfig, middlewares: [['validate', alias], challengeTokenMiddleware()] })
export class ConfirmEmailUserAction extends AbstractAction {
  constructor(private authRepository: AuthRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    await this.authRepository.clearTokenByEmail(params.email, this.authRepository.CONFIRMED_STATUS);

    return true;
  }
}
