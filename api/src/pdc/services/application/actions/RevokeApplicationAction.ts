import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyFromContextMiddleware, hasPermissionByScopeMiddleware } from "@/pdc/providers/middleware/index.ts";

import { RevokeApplication } from "@/pdc/services/application/dto/RevokeApplication.ts";
import { ApplicationPgRepositoryProvider } from "@/pdc/services/application/providers/ApplicationPgRepositoryProvider.ts";

@handler({
  service: "application",
  method: "revoke",
  middlewares: [
    copyFromContextMiddleware("call.user.operator_id", "owner_id"),
    hasPermissionByScopeMiddleware(undefined, [
      "operator.application.revoke",
      "call.user.operator_id",
      "owner_id",
    ]),
    ["validate", RevokeApplication],
  ],
})
export class RevokeApplicationAction extends AbstractAction {
  constructor(
    private applicationRepository: ApplicationPgRepositoryProvider,
  ) {
    super();
  }

  public async handle(
    params: RevokeApplication,
  ): Promise<void> {
    await this.applicationRepository.revoke({
      ...params,
      owner_service: "operator",
    });
  }
}
