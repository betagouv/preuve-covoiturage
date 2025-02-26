import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/middlewares.ts";
import { Operators } from "@/pdc/services/dashboard/dto/Operators.ts";
import { OperatorsRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/OperatorsRepositoryInterface.ts";
export type ResultInterface = {
  meta: {
    page: number;
    total: number;
    totalPages: number;
  };
  data: {
    id: string;
    name: string;
    siret: string;
  }[];
};

@handler({
  service: "dashboard",
  method: "operators",
  middlewares: [
    ["validate", Operators],
    hasPermissionMiddleware("common.operator.list"),
  ],
  apiRoute: {
    path: "/dashboard/operators",
    action: "dashboard:operators",
    method: "GET",
  },
})
export class OperatorsAction extends AbstractAction {
  constructor(private repository: OperatorsRepositoryInterfaceResolver) {
    super();
  }

  public override async handle(params: Operators): Promise<ResultInterface> {
    return this.repository.getOperators(params);
  }
}
