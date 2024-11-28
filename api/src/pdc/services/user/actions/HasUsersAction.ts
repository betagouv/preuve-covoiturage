import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { internalOnlyMiddlewares } from "@/pdc/providers/middleware/index.ts";

import { handlerConfig, ResultInterface } from "../contracts/hasUsers.contract.ts";
import { UserRepositoryProviderInterfaceResolver } from "../interfaces/UserRepositoryProviderInterface.ts";

/*
 * Change password of user by sending old & new password
 */
@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares("trip")],
})
export class HasUsersAction extends AbstractAction {
  constructor(private userRepository: UserRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(): Promise<ResultInterface> {
    return this.userRepository.hasUsers();
  }
}
