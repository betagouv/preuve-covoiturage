import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { CompanyDataSourceProviderInterfaceResolver } from '../interfaces/CompanyDataSourceProviderInterface';
import { CompanyRepositoryProviderInterfaceResolver } from '../interfaces/CompanyRepositoryProviderInterface';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/company/fetch.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/company/fetch.schema';

@handler(handlerConfig)
export class FetchAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [
    ['validate', alias],
    ['can', ['company.fetch']],
  ];

  constructor(
    private ds: CompanyDataSourceProviderInterfaceResolver,
    private repository: CompanyRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(siret: ParamsInterface): Promise<ResultInterface> {
    const data = await this.ds.find(siret);
    await this.repository.updateOrCreate(data);
  }
}
