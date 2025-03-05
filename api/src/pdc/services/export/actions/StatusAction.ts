import { handler } from "@/ilos/common/Decorators.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/middlewares.ts";
import { handlerConfig, ParamsInterface, ResultInterface } from "../contracts/status.contract.ts";
import { alias } from "../contracts/status.schema.ts";
import { ExportRepositoryInterfaceResolver } from "../repositories/ExportRepository.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    hasPermissionMiddleware("common.export.read"),
    ["validate", alias],
  ],
  apiRoute: {
    path: "/exports/:uuid/status",
    action: "export:status",
    method: "GET",
  },
})
export class StatusAction extends AbstractAction {
  constructor(protected exportRepository: ExportRepositoryInterfaceResolver) {
    super();
  }

  protected async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.exportRepository.status(params.uuid);
  }
}
