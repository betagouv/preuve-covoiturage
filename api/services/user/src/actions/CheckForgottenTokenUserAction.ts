import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, UnauthorizedException } from '@ilos/common';

import { configHandler, ParamsInterface, ResultInterface } from '../shared/user/checkForgottenToken.contract';
import { alias } from '../shared/user/checkForgottenToken.schema';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { ForgottenTokenValidatorProviderInterface } from '../interfaces/ForgottenTokenValidatorProviderInterface';

/*
 * check forgotten_token identifying the user by email
 */
@handler(configHandler)
export class CheckForgottenTokenUserAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['validate', alias]];

  constructor(private tokenValidator: ForgottenTokenValidatorProviderInterface) {
    super();
  }

  public async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const user = await this.tokenValidator.checkToken(params.email, params.forgotten_token);
    if (this.tokenValidator.isExpired('confirmation', user.forgotten_at)) {
      throw new UnauthorizedException('Expired token');
    }

    return true;
  }
}
