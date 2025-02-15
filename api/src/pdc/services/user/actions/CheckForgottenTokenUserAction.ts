import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";

import { handlerConfig, ResultInterface } from "../contracts/checkForgottenToken.contract.ts";
import { alias } from "../contracts/checkForgottenToken.schema.ts";
import { challengeTokenMiddleware } from "../middlewares/ChallengeTokenMiddleware.ts";

/*
 * check forgotten_token identifying the user by email
 */
@handler({
  ...handlerConfig,
  middlewares: [["validate", alias], challengeTokenMiddleware()],
})
export class CheckForgottenTokenUserAction extends AbstractAction {
  constructor() {
    super();
  }

  public async handle(): Promise<ResultInterface> {
    return true;
  }
}
