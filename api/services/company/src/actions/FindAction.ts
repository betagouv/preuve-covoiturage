import { Action as AbstractAction } from '@ilos/core';
import { handler, KernelInterfaceResolver } from '@ilos/common';

import { CompanyDataSourceProviderInterfaceResolver } from '../interfaces/CompanyDataSourceProviderInterface';
import { CompanyRepositoryProviderInterfaceResolver } from '../interfaces/CompanyRepositoryProviderInterface';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/company/find.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { alias } from '../shared/company/find.schema';
import { signature as fetchSignature } from '../shared/company/fetch.contract';

@handler(handlerConfig)
export class FindAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [
    ['validate', alias],
    ['can', ['company.find']],
  ];

  constructor(
    private ds: CompanyDataSourceProviderInterfaceResolver,
    private repository: CompanyRepositoryProviderInterfaceResolver,
    private kernel: KernelInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const { siret, source } = params;
    if (source && source === 'remote') {
      return this.ds.find(siret);
    }

    try {
      const res = await this.repository.find(siret);

      if (res === undefined) {
        await this.kernel.call(fetchSignature, siret, {
          call: {
            user: {
              permissions: ['company.fetch'],
            },
          },
          channel: {
            service: handlerConfig.service,
          },
        });
        return this.handle(params);
      }

      return res;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
