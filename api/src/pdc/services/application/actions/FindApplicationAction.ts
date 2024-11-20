import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyFromContextMiddleware, hasPermissionByScopeMiddleware } from "@/pdc/providers/middleware/index.ts";

import { FindApplication } from "@/pdc/services/application/dto/FindApplication.ts";
import { ApplicationInterface } from "@/pdc/services/application/interfaces/ApplicationInterface.ts";
import { ApplicationPgRepositoryProvider } from "@/pdc/services/application/providers/ApplicationPgRepositoryProvider.ts";

@handler({
  service: "application",
  method: "find",
  middlewares: [
    copyFromContextMiddleware("call.user.operator_id", "owner_id"),
    hasPermissionByScopeMiddleware("proxy.application.find", [
      "operator.application.find",
      "call.user.operator_id",
      "owner_id",
    ]),
    ["validate", FindApplication],
  ],
})
export class FindApplicationAction extends AbstractAction {
  constructor(
    private applicationRepository: ApplicationPgRepositoryProvider,
  ) {
    super();
  }

  public async handle(
    params: FindApplication,
  ): Promise<ApplicationInterface> {
    return this.applicationRepository.find({
      ...params,
      owner_service: "operator",
    });
  }
}
