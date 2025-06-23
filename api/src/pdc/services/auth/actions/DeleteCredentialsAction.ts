import { handler } from "@/ilos/common/Decorators.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyFromContextMiddleware } from "@/pdc/providers/middleware/middlewares.ts";
import { DexClient } from "@/pdc/services/auth/providers/DexClient.ts";
import { castOperatorIdActionParam } from "@/pdc/services/auth/route/OperatorIdCastingActionParam.ts";
import { DeleteCredentialsParams, DeleteCredentialsResult } from "../dto/Credentials.ts";

@handler({
  service: "auth",
  method: "deleteCredentials",
  middlewares: [
    copyFromContextMiddleware(`call.user.operator_id`, "operator_id", false),
    ["validate", DeleteCredentialsParams],
  ],
  apiRoute: {
    path: "/auth/credentials",
    method: "DELETE",
    successHttpCode: 204,
    actionParamsFn: castOperatorIdActionParam,
  },
})
export class DeleteCredentialsAction extends AbstractAction {
  constructor(private dexClient: DexClient) {
    super();
  }

  protected override async handle(params: DeleteCredentialsParams): Promise<DeleteCredentialsResult> {
    return this.dexClient.deleteByOperator(params.operator_id, params.token_id);
  }
}
