import { Action as AbstractAction } from '@ilos/core';
import { handler, KernelInterfaceResolver, NotFoundException } from '@ilos/common';

import { CompanyDataSourceProviderInterfaceResolver } from '../interfaces/CompanyDataSourceProviderInterface';
import { CompanyRepositoryProviderInterfaceResolver } from '../interfaces/CompanyRepositoryProviderInterface';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/company/find.contract';
import { alias } from '../shared/company/find.schema';
import { signature as fetchSignature } from '../shared/company/fetch.contract';

@handler({
  ...handlerConfig,
  middlewares: [
    ['validate', alias],
    ['can', ['company.find']],
  ],
})
export class FindAction extends AbstractAction {
  constructor(
    private ds: CompanyDataSourceProviderInterfaceResolver,
    private repository: CompanyRepositoryProviderInterfaceResolver,
    private kernel: KernelInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    const { query: { siret, _id }, forceRemoteUpdate } = params;

    if (forceRemoteUpdate && siret) {
      await this.fetch(siret);
    }

    try {
      let res: ResultInterface;

      if (siret) {
        res = await this.repository.findBySiret(siret);
      } else {
        res = await this.repository.findById(_id);
      }

      if (res === null) {
        throw new NotFoundException(`Cant find this company, try force update`);
      }

      return res;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  protected async fetch(siret: string): Promise<void> {
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
  }
}
