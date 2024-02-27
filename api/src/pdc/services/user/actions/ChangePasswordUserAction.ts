import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { copyFromContextMiddleware, hasPermissionMiddleware } from '@pdc/providers/middleware';

import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/user/changePassword.contract';
import { alias } from '@shared/user/changePassword.schema';
import { UserContextInterface } from '@shared/user/common/interfaces/UserContextInterfaces';
import { AuthRepositoryProviderInterfaceResolver } from '../interfaces/AuthRepositoryProviderInterface';
import { challengePasswordMiddleware } from '../middlewares/ChallengePasswordMiddleware';

/*
 * Change password of user by sending old & new password
 */
@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    hasPermissionMiddleware('common.user.update'),
    copyFromContextMiddleware('call.user._id', '_id'),
    challengePasswordMiddleware({ idPath: '_id', passwordPath: 'old_password' }),
  ],
})
export class ChangePasswordUserAction extends AbstractAction {
  constructor(private authRepository: AuthRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: UserContextInterface): Promise<ResultInterface> {
    return this.authRepository.updatePasswordById(params._id, params.new_password);
  }
}
