import { handler } from "@/ilos/common/Decorators.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyFromContextMiddleware } from "@/pdc/providers/middleware/middlewares.ts";
import { AccessToken, CrudAccessTokenParams } from "@/pdc/services/auth/dto/AccessToken.ts";
import { DexClient } from "@/pdc/services/auth/providers/DexClient.ts";
import { castOperatorIdActionParam } from "@/pdc/services/auth/route/OperatorIdCastingActionParam.ts";

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
    actionParamsFn: castOperatorIdActionParam
  },
})
export class ListAccessTokenAction extends AbstractAction {
  constructor(
    private dexClient: DexClient,
  ) {
    super();
  }

  protected override async handle(params: CrudAccessTokenParams): Promise<AccessToken[]> {
    return this.dexClient.listByOperator(params.operator_id) 
  }
}
