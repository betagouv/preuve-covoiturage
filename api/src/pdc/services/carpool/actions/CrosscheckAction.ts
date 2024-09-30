import { handler, UnimplementedException } from "@/ilos/common/index.ts";
import { Action } from "@/ilos/core/index.ts";
import { internalOnlyMiddlewares } from "@/pdc/providers/middleware/index.ts";

import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/shared/carpool/crosscheck.contract.ts";
import { alias } from "@/shared/carpool/crosscheck.schema.ts";

/*
 * Import journey in carpool database
 */
@handler({
  ...handlerConfig,
  middlewares: [
    ...internalOnlyMiddlewares("acquisition", handlerConfig.service),
    ["validate", alias],
  ],
})
export class CrosscheckAction extends Action {
  public async handle(journey: ParamsInterface): Promise<ResultInterface> {
    throw new UnimplementedException();
  }
}
