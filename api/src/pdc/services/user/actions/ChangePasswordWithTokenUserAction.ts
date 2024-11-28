import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";

import { handlerConfig, ParamsInterface, ResultInterface } from "../contracts/changePasswordWithToken.contract.ts";
import { alias } from "../contracts/changePasswordWithToken.schema.ts";
import { AuthRepositoryProviderInterfaceResolver } from "../interfaces/AuthRepositoryProviderInterface.ts";
import { challengeTokenMiddleware } from "../middlewares/ChallengeTokenMiddleware.ts";

/*
 * Change password using the email and forgotten_token for auth
 */
@handler({
  ...handlerConfig,
  middlewares: [["validate", alias], challengeTokenMiddleware()],
})
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
