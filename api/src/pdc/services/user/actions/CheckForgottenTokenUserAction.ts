import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { handlerConfig, ResultInterface } from '@shared/user/checkForgottenToken.contract';
import { alias } from '@shared/user/checkForgottenToken.schema';
import { challengeTokenMiddleware } from '../middlewares/ChallengeTokenMiddleware';

/*
 * check forgotten_token identifying the user by email
 */
@handler({ ...handlerConfig, middlewares: [['validate', alias], challengeTokenMiddleware()] })
export class CheckForgottenTokenUserAction extends AbstractAction {
  constructor() {
    super();
  }

  public async handle(): Promise<ResultInterface> {
    return true;
  }
}
