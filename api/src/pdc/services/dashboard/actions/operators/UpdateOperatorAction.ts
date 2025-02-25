import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { copyGroupIdAndApplyGroupPermissionMiddlewares } from "@/pdc/providers/middleware/index.ts";
import { UpdateOperator } from "@/pdc/services/dashboard/dto/Operators.ts";
import { OperatorsRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/OperatorsRepositoryInterface.ts";
export type ResultInterface = {
  success: boolean;
  message: string;
};

@handler({
  service: "dashboard",
  method: "updateOperator",
  middlewares: [
    ["validate", UpdateOperator],
    ...copyGroupIdAndApplyGroupPermissionMiddlewares({
      registry: "registry.operator.update",
      operator: "operator.operator.update",
    }),
  ],
  apiRoute: {
    path: "/dashboard/operator",
    action: "dashboard:updateOperator",
    method: "PUT",
  },
})
export class UpdateOperatorAction extends AbstractAction {
  constructor(private repository: OperatorsRepositoryInterfaceResolver) {
    super();
  }

  public override async handle(data: UpdateOperator): Promise<ResultInterface> {
    return this.repository.updateOperator(data);
  }
}
