import { Action as AbstractAction } from '@ilos/core';
import { handler, ForbiddenException } from '@ilos/common';

import { configHandler, ParamsInterface, ResultInterface } from '../shared/user/changePassword.contract';
import { alias } from '../shared/user/changePassword.schema';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { UserContextInterface } from '../shared/user/common/interfaces/UserContextInterfaces';
import { AuthRepositoryProviderInterfaceResolver } from '../interfaces/AuthRepositoryProviderInterface';

/*
 * Change password of user by sending old & new password
 */
@handler(configHandler)
export class ChangePasswordUserAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['validate', alias], ['can', ['profile.update']]];

  constructor(private authRepository: AuthRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface, context: UserContextInterface): Promise<ResultInterface> {
    const id = context.call.user._id;

    if (!(await this.authRepository.challengePasswordById(id, params.old_password))) {
      throw new ForbiddenException('Wrong credentials');
    }

    await this.authRepository.updatePasswordById(id, params.new_password);

    return true;
  }
}
