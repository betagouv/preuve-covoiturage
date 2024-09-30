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
} from "@/shared/trip/sendExport.contract.ts";
import { alias } from "@/shared/trip/sendExport.schema.ts";

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares(handlerConfig.service), [
    "validate",
    alias,
  ]],
})
export class SendExportAction extends Action {
  protected defaultContext: ContextType = {
    channel: {
      service: "trip",
    },
    call: {
      user: {},
    },
  };

  public async handle(
    params: ParamsInterface,
    context: ContextType,
  ): Promise<ResultInterface> {
    throw new UnimplementedException();
  }
}
