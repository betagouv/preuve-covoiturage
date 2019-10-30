import { Action as AbstractAction } from '@ilos/core';
import { handler, UnauthorizedException } from '@ilos/common';

import { configHandler, ParamsInterface, ResultInterface } from '../shared/user/checkForgottenToken.contract';
import { alias } from '../shared/user/checkForgottenToken.schema';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { AuthRepositoryProviderInterfaceResolver } from '../interfaces/AuthRepositoryProviderInterface';

/*
 * check forgotten_token identifying the user by email
 */
@handler(configHandler)
export class CheckForgottenTokenUserAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['validate', alias]];

  constructor(private authRepository: AuthRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    if (!(await this.authRepository.challengeTokenByEmail(params.email, params.token))) {
      throw new UnauthorizedException('Wrong token');
    }

    return true;
  }
}
