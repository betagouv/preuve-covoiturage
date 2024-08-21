import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { handler } from "@/ilos/common/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";

import { alias } from "@/shared/observatory/keyfigures/getKeyfigures.schema.ts";
import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/shared/observatory/keyfigures/getKeyfigures.contract.ts";
import { KeyfiguresRepositoryInterfaceResolver } from "../../interfaces/KeyfiguresRepositoryProviderInterface.ts";
import { limitNumberParamWithinRange } from "../../helpers/checkParams.ts";

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
