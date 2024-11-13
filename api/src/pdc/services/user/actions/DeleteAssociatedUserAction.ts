import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { internalOnlyMiddlewares } from "@/pdc/providers/middleware/index.ts";

import { logger } from "@/lib/logger/index.ts";
import { handlerConfig, ParamsInterface, ResultInterface } from "../contracts/deleteAssociated.contract.ts";
import { alias } from "../contracts/deleteAssociated.schema.ts";
import { UserRepositoryProviderInterfaceResolver } from "../interfaces/UserRepositoryProviderInterface.ts";

/*
 *  Find user by id and delete user
 */

// What is the difference with DeleteUserAction
@handler({
  ...handlerConfig,
  middlewares: [
    ["validate", alias],
    ...internalOnlyMiddlewares("territory", "operator"),
  ],
})
export class DeleteAssociatedUserAction extends AbstractAction {
  constructor(private userRepository: UserRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const key = Object.keys(params)[0];

    // KEEP ME
    logger.info(`> [user:deleteAssociated] ${key}: ${params[key]}`);

    await this.userRepository.deleteAssociated(key, params[key]);
  }
}
