import { handler } from "@/ilos/common/Decorators.ts";
import { NotFoundException } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { enforceOperatorMiddleware, hasPermissionByScopeMiddleware } from "@/pdc/providers/middleware/middlewares.ts";
import { DexClient } from "@/pdc/services/auth/providers/DexClient.ts";
import { ReadCredentialsParams, ReadCredentialsResult } from "../dto/Credentials.ts";
import { OperatorRepository } from "../providers/OperatorRepository.ts";

@handler({
  service: "auth",
  method: "readCredentials",
  middlewares: [
    enforceOperatorMiddleware(),
    hasPermissionByScopeMiddleware("registry.credentials.read", [
      "operator.credentials.read",
      "call.user.operator_id",
      "operator_id",
    ]),
    ["validate", ReadCredentialsParams],
  ],
  apiRoute: {
    path: "/auth/credentials",
    method: "GET",
    successHttpCode: 200,
  },
})
export class ReadCredentialsAction extends AbstractAction {
  constructor(private dexClient: DexClient, private operatorRepository: OperatorRepository) {
    super();
  }

  protected override async handle(params: ReadCredentialsParams): Promise<ReadCredentialsResult> {
    if (!params.operator_id || !(await this.operatorRepository.exists(params.operator_id))) {
      throw new NotFoundException(`Operator with ID ${params.operator_id} does not exist`);
    }

    return this.dexClient.readByOperator(params.operator_id);
  }
}
