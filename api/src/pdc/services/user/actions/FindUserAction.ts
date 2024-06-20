import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { handler } from "@/ilos/common/index.ts";
import {
  contentWhitelistMiddleware,
  copyGroupIdAndApplyGroupPermissionMiddlewares,
} from "@/pdc/providers/middleware/index.ts";

import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/shared/user/find.contract.ts";
import { alias } from "@/shared/user/find.schema.ts";
import { UserContextInterface } from "@/shared/user/common/interfaces/UserContextInterfaces.ts";
import { UserRepositoryProviderInterfaceResolver } from "../interfaces/UserRepositoryProviderInterface.ts";
import { userWhiteListFilterOutput } from "../config/filterOutput.ts";

/*
 * Find user by id
 */

@handler({
  ...handlerConfig,
  middlewares: [
    ["validate", alias],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      user: "common.user.find",
      registry: "registry.user.find",
      territory: "territory.user.find",
      operator: "operator.user.find",
    }),
    contentWhitelistMiddleware(...userWhiteListFilterOutput),
  ],
})
export class FindUserAction extends AbstractAction {
  constructor(private userRepository: UserRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(
    params: ParamsInterface,
    context: UserContextInterface,
  ): Promise<ResultInterface> {
    const scope = params.territory_id
      ? "territory_id"
      : params.operator_id
      ? "operator_id"
      : "none";
    switch (scope) {
      case "territory_id":
        return this.userRepository.findByTerritory(params._id, params[scope]);
      case "operator_id":
        return this.userRepository.findByOperator(params._id, params[scope]);
      case "none":
        return this.userRepository.find(params._id);
    }
  }
}
