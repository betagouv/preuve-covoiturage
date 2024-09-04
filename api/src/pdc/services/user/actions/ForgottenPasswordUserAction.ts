import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { handler } from "@/ilos/common/index.ts";

import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/shared/user/forgottenPassword.contract.ts";
import { alias } from "@/shared/user/forgottenPassword.schema.ts";
import { AuthRepositoryProviderInterfaceResolver } from "../interfaces/AuthRepositoryProviderInterface.ts";
import { UserRepositoryProviderInterfaceResolver } from "../interfaces/UserRepositoryProviderInterface.ts";
import { UserNotificationProvider } from "../providers/UserNotificationProvider.ts";

/*
 * find user by email and send email to set new password
 */
@handler({ ...handlerConfig, middlewares: [["validate", alias]] })
export class ForgottenPasswordUserAction extends AbstractAction {
  constructor(
    private authRepository: AuthRepositoryProviderInterfaceResolver,
    private userRepository: UserRepositoryProviderInterfaceResolver,
    private notification: UserNotificationProvider,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const user = await this.userRepository.findByEmail(params.email);
    if (!user) {
      return;
    }

    const token = await this.authRepository.createTokenByEmail(
      params.email,
      this.authRepository.RESET_TOKEN,
    );

    await this.notification.passwordForgotten(
      token,
      params.email,
      `${user.firstname} ${user.lastname}`,
    );
  }
}
