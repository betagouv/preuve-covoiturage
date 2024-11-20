import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyFromContextMiddleware, hasPermissionByScopeMiddleware } from "@/pdc/providers/middleware/index.ts";

import { ListApplication } from "@/pdc/services/application/dto/ListApplication.ts";
import { ApplicationInterface } from "@/pdc/services/application/interfaces/ApplicationInterface.ts";
import { ApplicationPgRepositoryProvider } from "@/pdc/services/application/providers/ApplicationPgRepositoryProvider.ts";

@handler({
  service: "application",
  method: "list",
  middlewares: [
    copyFromContextMiddleware("call.user.operator_id", "owner_id"),
    hasPermissionByScopeMiddleware(undefined, [
      "operator.application.list",
      "call.user.operator_id",
      "owner_id",
    ]),
    ["validate", ListApplication],
  ],
})
export class ListApplicationAction extends AbstractAction {
  constructor(
    private applicationRepository: ApplicationPgRepositoryProvider,
  ) {
    super();
  }

  public async handle(
    params: ListApplication,
  ): Promise<Array<ApplicationInterface>> {
    return this.applicationRepository.list({
      ...params,
      owner_service: "operator",
    });
  }
}
