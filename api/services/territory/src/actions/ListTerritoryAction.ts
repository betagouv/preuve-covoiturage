import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { handlerConfig, ResultInterface } from '../shared/territory/list.contract';
import { blacklist } from '../config/filterOutput';

@handler({ ...handlerConfig, middlewares: [['content.blacklist', blacklist.map((k) => `data.*.${k}`)]] })
export class ListTerritoryAction extends AbstractAction {
  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(): Promise<ResultInterface> {
    const data = await this.territoryRepository.all();

    return {
      data,
      // TODO: check constitancy
      meta: { pagination: { total: data.length, offset: 0, limit: data.length } },
    };
  }
}
