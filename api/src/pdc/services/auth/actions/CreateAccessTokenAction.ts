import { handler } from "@/ilos/common/Decorators.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyFromContextMiddleware } from "@/pdc/providers/middleware/middlewares.ts";
import { CrudAccessTokenParams } from "@/pdc/services/auth/dto/AccessToken.ts";
import { DexClient } from "@/pdc/services/auth/providers/DexClient.ts";

@handler({
  service: "auth",
  method: "accessTokenCreate",
  middlewares: [
    copyFromContextMiddleware(`call.user.operator_id`, "operator_id", false),
    ["validate", CrudAccessTokenParams],
  ],
  apiRoute: {
    path: "/auth/access_token",
    method: "GET",
    successHttpCode: 200,
  },
})
export class CreateAccessTokenAction extends AbstractAction {
  constructor(
    private dexClient: DexClient,
  ) {
    super();
  }

  protected override async handle(params: { operator_id: number}): Promise<{uuid: string, password: string}> {
    return this.dexClient.createForOperator(params.operator_id)
  }
}
