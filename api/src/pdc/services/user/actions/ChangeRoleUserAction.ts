import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { ContextType, handler } from "@/ilos/common/index.ts";
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from "@/pdc/providers/middleware/index.ts";

import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/shared/user/changeRole.contract.ts";
import { alias } from "@/shared/user/changeRole.schema.ts";
import { UserRepositoryProviderInterfaceResolver } from "../interfaces/UserRepositoryProviderInterface.ts";

/*
 * Update role of user
 */

@handler({
  ...handlerConfig,
  middlewares: [
    ["validate", alias],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      registry: "registry.user.update",
      territory: "territory.user.update",
      operator: "operator.user.update",
    }),
  ],
})
export class ChangeRoleUserAction extends AbstractAction {
  constructor(private userRepository: UserRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(
    params: ParamsInterface,
    context: ContextType,
  ): Promise<ResultInterface> {
    const scope = params.territory_id
      ? "territory_id"
      : params.operator_id
      ? "operator_id"
      : "none";
    switch (scope) {
      case "territory_id":
        await this.userRepository.patchByTerritory(params._id, {
          role: params.role,
        }, params[scope]);
        break;
      case "operator_id":
        await this.userRepository.patchByOperator(params._id, {
          role: params.role,
        }, params[scope]);
        break;
      case "none":
        await this.userRepository.patch(params._id, { role: params.role });
        break;
    }

    return true;
  }
}
