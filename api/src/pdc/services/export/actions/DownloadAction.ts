import { handler } from "@/ilos/common/Decorators.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/middlewares.ts";
import { handlerConfig, ParamsInterface, ResultInterface } from "../contracts/download.contract.ts";
import { alias } from "../contracts/download.schema.ts";
import { ExportRepositoryInterfaceResolver } from "../repositories/ExportRepository.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    hasPermissionMiddleware("common.export.download"),
    ["validate", alias],
  ],
  apiRoute: {
    path: "/exports/:uuid/attachment",
    action: "export:download",
    method: "GET",
  },
})
export class DownloadAction extends AbstractAction {
  constructor(protected exportRepository: ExportRepositoryInterfaceResolver) {
    super();
  }

  protected async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.exportRepository.download(params.uuid);
  }
}
