import {
  ContextType,
  handler,
  UnimplementedException,
} from "@/ilos/common/index.ts";
import { Action } from "@/ilos/core/index.ts";
import {
  copyFromContextMiddleware,
  validateDateMiddleware,
} from "@/pdc/providers/middleware/index.ts";

import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/shared/trip/financialStats.contract.ts";
import { alias } from "@/shared/trip/stats.schema.ts";
import * as middlewareConfig from "../config/middlewares.ts";

@handler({
  ...handlerConfig,
  middlewares: [
    copyFromContextMiddleware(`call.user.operator_id`, "operator_id", true),
    ["validate", alias],
    validateDateMiddleware({
      startPath: "date.start",
      endPath: "date.end",
      minStart: () =>
        new Date(new Date().getTime() - middlewareConfig.date.minStartDefault),
      maxEnd: () => new Date(),
      applyDefault: true,
    }),
  ],
})
export class FinancialStatsAction extends Action {
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
