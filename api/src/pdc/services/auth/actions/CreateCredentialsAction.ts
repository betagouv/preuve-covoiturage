import { handler } from "@/ilos/common/Decorators.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyFromContextMiddleware } from "@/pdc/providers/middleware/middlewares.ts";
import { DexClient } from "@/pdc/services/auth/providers/DexClient.ts";
import { castOperatorIdActionParam } from "@/pdc/services/auth/route/OperatorIdCastingActionParam.ts";
import { CreateCredentialsParams, CreateCredentialsResult } from "../dto/Credentials.ts";

@handler({
  service: "auth",
  method: "createCredentials",
  middlewares: [
    copyFromContextMiddleware(`call.user.operator_id`, "operator_id", false),
    ["validate", CreateCredentialsParams],
  ],
  apiRoute: {
    path: "/auth/credentials",
    method: "POST",
    successHttpCode: 201,
    actionParamsFn: castOperatorIdActionParam,
  },
})
export class CreateCredentialsAction extends AbstractAction {
  constructor(private dexClient: DexClient) {
    super();
  }

  protected override async handle(params: CreateCredentialsParams): Promise<CreateCredentialsResult> {
    return this.dexClient.createForOperator(params.operator_id);
  }
}
