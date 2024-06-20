import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { handler, UnauthorizedException } from "@/ilos/common/index.ts";
import { contentWhitelistMiddleware } from "@/pdc/providers/middleware/index.ts";

import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/shared/user/login.contract.ts";
import { alias } from "@/shared/user/login.schema.ts";
import { userWhiteListFilterOutput } from "../config/filterOutput.ts";

import { UserRepositoryProviderInterfaceResolver } from "../interfaces/UserRepositoryProviderInterface.ts";
import { challengePasswordMiddleware } from "../middlewares/ChallengePasswordMiddleware.ts";

/*
 * Authenticate user by email & pwd - else throws forbidden error
 */
@handler({
  ...handlerConfig,
  middlewares: [
    ["validate", alias],
    challengePasswordMiddleware({
      emailPath: "email",
      passwordPath: "password",
    }),
    contentWhitelistMiddleware(...userWhiteListFilterOutput),
  ],
})
export class LoginUserAction extends AbstractAction {
  constructor(private userRepository: UserRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const user = await this.userRepository.findByEmail(params.email);
    switch (user.status) {
      case "pending":
        throw new UnauthorizedException("Account is pending validation");
      case "invited":
        throw new UnauthorizedException("Account must be confirmed");
      case "blocked":
        throw new UnauthorizedException("Account is blocked");
      default:
    }

    // update last_login timestamp
    await this.userRepository.touchLastLogin(user._id);

    return user;
  }
}
