import { handler } from "@/ilos/common/Decorators.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyFromContextMiddleware } from "@/pdc/providers/middleware/middlewares.ts";
import { DeleteAccessTokenBody } from "@/pdc/services/auth/dto/AccessToken.ts";
import { DexClient } from "@/pdc/services/auth/providers/DexClient.ts";

@handler({
  service: "auth",
  method: "accessTokenDelete",
  middlewares: [
    copyFromContextMiddleware(`call.user.operator_id`, "operator_id", false),
    ["validate", DeleteAccessTokenBody],
  ],
  apiRoute: {
    path: "/auth/access_token",
    method: "DELETE",
    successHttpCode: 200,
  },
})
export class DeleteAccessTokenAction extends AbstractAction {
  constructor(
    private dexClient: DexClient,
  ) {
    super();
  }

  protected override async handle(params: DeleteAccessTokenBody): Promise<void> {
    return this.dexClient.deleteByOperator(parseInt(params.operator_id), params.token_id); 
  }
}
