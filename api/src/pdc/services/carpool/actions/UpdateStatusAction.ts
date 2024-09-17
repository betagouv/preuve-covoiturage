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
} from "@/shared/carpool/updateStatus.contract.ts";

/*
 * Import journey in carpool database
 */
@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares("acquisition", "fraudcheck")],
})
export class UpdateStatusAction extends Action {
  constructor() {
    super();
  }

  public async handle(
    { acquisition_id, status }: ParamsInterface,
    context: ContextType,
  ): Promise<ResultInterface> {
    throw new UnimplementedException();
  }
}
