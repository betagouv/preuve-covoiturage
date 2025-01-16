import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/middlewares.ts";
import { Operators } from "@/pdc/services/dashboard/dto/Operators.ts";
import { OperatorsRepositoryInterfaceResolver } from "@/pdc/services/dashboard/interfaces/OperatorsRepositoryProviderInterface.ts";
export type ResultInterface = {
  id: number;
  name: string;
  legal_name: string;
  siret: number;
}[];

@handler({
  service: "dashboard",
  method: "operators",
  middlewares: [
    ["validate", Operators],
    hasPermissionMiddleware("common.operator.list"),
  ],
})
export class OperatorsAction extends AbstractAction {
  constructor(private repository: OperatorsRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: Operators): Promise<ResultInterface> {
    return this.repository.getOperators(params);
  }
}
