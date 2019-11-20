import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { CompanyDataSourceProviderInterfaceResolver } from '../interfaces/CompanyDataSourceProviderInterface';
import { CompanyRepositoryProviderInterfaceResolver } from '../interfaces/CompanyRepositoryProviderInterface';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/company/find.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/company/find.schema';

@handler(handlerConfig)
export class FindAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['validate', alias], ['can', ['company.find']]];

  constructor(
    private ds: CompanyDataSourceProviderInterfaceResolver,
    private repository: CompanyRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const { siret, source } = params;
    const res = source && source === 'remote' ? await this.ds.find(siret) : await this.repository.find(siret);
    return res;
  }
}
