import { handler } from "@/ilos/common/Decorators.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/middlewares.ts";
import { handlerConfig, ParamsInterface, ResultInterface } from "../contracts/list.contract.ts";
import { alias } from "../contracts/list.schema.ts";
import { ExportRepositoryInterfaceResolver } from "../repositories/ExportRepository.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    hasPermissionMiddleware("common.export.list"),
    ["validate", alias],
  ],
  apiRoute: {
    path: "/exports",
    action: "export:list",
    method: "GET",
  },
})
export class ListAction extends AbstractAction {
  constructor(protected exportRepository: ExportRepositoryInterfaceResolver) {
    super();
  }

  protected async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.exportRepository.list(params);
  }
}
