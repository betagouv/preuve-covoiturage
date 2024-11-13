import { handler } from "@/ilos/common/index.ts";
import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";

import { handlerConfig, ParamsInterface, ResultInterface } from "../../contracts/keyfigures/getKeyfigures.contract.ts";
import { alias } from "../../contracts/keyfigures/getKeyfigures.schema.ts";
import { limitNumberParamWithinRange } from "../../helpers/checkParams.ts";
import { KeyfiguresRepositoryInterfaceResolver } from "../../interfaces/KeyfiguresRepositoryProviderInterface.ts";

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware("common.observatory.stats"), [
    "validate",
    alias,
  ]],
})
export class KeyfiguresAction extends AbstractAction {
  constructor(private repository: KeyfiguresRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    params.year = limitNumberParamWithinRange(
      params.year,
      2020,
      new Date().getFullYear(),
    );
    return this.repository.getKeyfigures(params);
  }
}
