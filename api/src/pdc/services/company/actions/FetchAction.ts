import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { hasPermissionMiddleware } from '@pdc/providers/middleware';

import { CompanyDataSourceProviderInterfaceResolver } from '../interfaces/CompanyDataSourceProviderInterface';
import { CompanyRepositoryProviderInterfaceResolver } from '../interfaces/CompanyRepositoryProviderInterface';

import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/company/fetch.contract';
import { alias } from '@shared/company/fetch.schema';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('common.company.fetch'), ['validate', alias]],
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
