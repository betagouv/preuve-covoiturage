import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyFromContextMiddleware, hasPermissionByScopeMiddleware } from "@/pdc/providers/middleware/index.ts";

import { CreateApplication } from "@/pdc/services/application/dto/CreateApplication.ts";
import { ApplicationPgRepositoryProvider } from "@/pdc/services/application/providers/ApplicationPgRepositoryProvider.ts";
import { ApplicationInterface } from "../interfaces/ApplicationInterface.ts";

@handler({
  service: "application",
  method: "create",
  middlewares: [
    copyFromContextMiddleware("call.user.operator_id", "owner_id"),
    hasPermissionByScopeMiddleware(undefined, [
      "operator.application.create",
      "call.user.operator_id",
      "owner_id",
    ]),
    ["validate", CreateApplication],
  ],
})
export class CreateApplicationAction extends AbstractAction {
  constructor(
    private applicationRepository: ApplicationPgRepositoryProvider,
  ) {
    super();
  }

  public async handle(
    params: CreateApplication,
  ): Promise<ApplicationInterface> {
    return this.applicationRepository.create({
      ...params,
      owner_service: "operator",
      permissions: [],
    });
  }
}
