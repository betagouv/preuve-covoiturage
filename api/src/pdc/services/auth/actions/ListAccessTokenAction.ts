import { handler } from "@/ilos/common/Decorators.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyFromContextMiddleware } from "@/pdc/providers/middleware/middlewares.ts";
import { AccessToken, CrudAccessTokenParams } from "@/pdc/services/auth/dto/AccessToken.ts";
import { DexClient } from "@/pdc/services/auth/providers/DexClient.ts";

@handler({
  service: "auth",
  method: "accessTokenList",
  middlewares: [
    copyFromContextMiddleware(`call.user.operator_id`, "operator_id", false),
    ["validate", CrudAccessTokenParams],
  ],
  apiRoute: {
    path: "/auth/access_tokens",
    method: "GET",
    successHttpCode: 200,
  },
})
export class ListAccessTokenAction extends AbstractAction {
  constructor(
    private dexClient: DexClient,
  ) {
    super();
  }

  protected override async handle(params: {operator_id: number}): Promise<AccessToken[]> {
    return this.dexClient.listByOperator(params.operator_id) 
  }
}
