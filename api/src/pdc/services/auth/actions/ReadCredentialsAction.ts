import { handler } from "@/ilos/common/Decorators.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyFromContextMiddleware } from "@/pdc/providers/middleware/middlewares.ts";
import { DexClient } from "@/pdc/services/auth/providers/DexClient.ts";
import { castOperatorIdActionParam } from "@/pdc/services/auth/route/OperatorIdCastingActionParam.ts";
import { ReadCredentialsParams, ReadCredentialsResult } from "../dto/Credentials.ts";

@handler({
  service: "auth",
  method: "readCredentials",
  middlewares: [
    copyFromContextMiddleware(`call.user.operator_id`, "operator_id", false),
    ["validate", ReadCredentialsParams],
  ],
  apiRoute: {
    path: "/auth/credentials",
    method: "GET",
    successHttpCode: 200,
    actionParamsFn: castOperatorIdActionParam,
  },
})
export class ReadCredentialsAction extends AbstractAction {
  constructor(private dexClient: DexClient) {
    super();
  }

  protected override async handle(params: ReadCredentialsParams): Promise<ReadCredentialsResult> {
    return this.dexClient.readByOperator(params.operator_id);
  }
}
