import { handler, UnimplementedException } from "@/ilos/common/index.ts";
import { Action } from "@/ilos/core/index.ts";
import {
  copyFromContextMiddleware,
  internalOnlyMiddlewares,
} from "@/pdc/providers/middleware/index.ts";

import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/shared/carpool/findidentities.contract.ts";
import { alias } from "@/shared/carpool/findidentities.schema.ts";

/*
 * Dispatch carpool to other service when ready
 */
@handler({
  ...handlerConfig,
  middlewares: [
    ...internalOnlyMiddlewares("certificate"),
    copyFromContextMiddleware("call.user.operator_id", "operator_id"),
    ["validate", alias],
  ],
})
export class FindIdentitiesAction extends Action {
  constructor() {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    throw new UnimplementedException();
  }
}
