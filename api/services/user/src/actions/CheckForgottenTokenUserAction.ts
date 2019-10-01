import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, UnauthorizedException } from '@ilos/common';

import { ForgottenTokenValidatorProviderInterface } from '../interfaces/ForgottenTokenValidatorProviderInterface';

/*
 * check forgotten_token identifying the user by email
 */
@handler({
  service: 'user',
  method: 'checkForgottenToken',
})
export class CheckForgottenTokenUserAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [['validate', 'user.checkForgottenToken']];

  constructor(private tokenValidator: ForgottenTokenValidatorProviderInterface) {
    super();
  }

  public async handle(params: { email: string; forgotten_token: string }, context: ContextType): Promise<boolean> {
    const user = await this.tokenValidator.checkToken(params.email, params.forgotten_token);
    if (this.tokenValidator.isExpired('confirmation', user.forgotten_at)) {
      throw new UnauthorizedException('Expired token');
    }

    return true;
  }
}
