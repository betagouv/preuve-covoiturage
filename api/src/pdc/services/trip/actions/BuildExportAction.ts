import {
  ContextType,
  handler,
  UnimplementedException,
} from "@/ilos/common/index.ts";
import { Action } from "@/ilos/core/index.ts";
import { internalOnlyMiddlewares } from "@/pdc/providers/middleware/index.ts";
import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/shared/trip/buildExport.contract.ts";
import { alias } from "@/shared/trip/buildExport.schema.ts";

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service), [
    "validate",
    alias,
  ]],
})
export class BuildExportAction extends Action {
  constructor() {
    super();
  }

  public async handle(
    params: ParamsInterface,
    context: ContextType,
  ): Promise<ResultInterface> {
    throw new UnimplementedException();
  }
}
