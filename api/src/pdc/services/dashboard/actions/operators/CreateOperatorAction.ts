import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from "@/pdc/providers/middleware/index.ts";
import { CreateOperator } from "@/pdc/services/dashboard/dto/Operators.ts";
import { OperatorsRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/OperatorsRepositoryInterface.ts";
export type ResultInterface = {
  success: boolean;
  message: string;
};

@handler({
  service: "dashboard",
  method: "createOperator",
  middlewares: [
    ["validate", CreateOperator],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      registry: "registry.operator.create",
      operator: "operator.operator.create",
    }),
  ],
  apiRoute: {
    path: "/dashboard/operator",
    action: "dashboard:createOperator",
    method: "POST",
  },
})
export class CreateOperatorAction extends AbstractAction {
  constructor(private repository: OperatorsRepositoryInterfaceResolver) {
    super();
  }

  public override async handle(data: CreateOperator): Promise<ResultInterface> {
    return this.repository.createOperator(data);
  }
}
