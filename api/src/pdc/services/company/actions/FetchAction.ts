import { Action as AbstractAction } from "@/ilos/core/index.ts";
import { handler } from "@/ilos/common/index.ts";
import { hasPermissionMiddleware } from "@/pdc/providers/middleware/index.ts";

import { CompanyDataSourceProviderInterfaceResolver } from "../interfaces/CompanyDataSourceProviderInterface.ts";
import { CompanyRepositoryProviderInterfaceResolver } from "../interfaces/CompanyRepositoryProviderInterface.ts";

import {
  handlerConfig,
  ParamsInterface,
  ResultInterface,
} from "@/shared/company/fetch.contract.ts";
import { alias } from "@/shared/company/fetch.schema.ts";

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware("common.company.fetch"), [
    "validate",
    alias,
  ]],
})
export class FetchAction extends AbstractAction {
  constructor(
    private ds: CompanyDataSourceProviderInterfaceResolver,
    private repository: CompanyRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(siret: ParamsInterface): Promise<ResultInterface> {
    const data = await this.ds.find(siret);
    await this.repository.updateOrCreate(data);

    return this.repository.findBySiret(siret);
  }
}
