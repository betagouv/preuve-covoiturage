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
} from "@/shared/carpool/finduuid.contract.ts";
import { alias } from "@/shared/carpool/finduuid.schema.ts";

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
export class FindUuidAction extends Action {
  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    throw new UnimplementedException();
  }
}
