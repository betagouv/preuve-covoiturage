import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { configHandler, ResultInterface } from '../shared/territory/list.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { blacklist } from '../config/filterOutput';

@handler(configHandler)
export class ListTerritoryAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['content.blacklist', blacklist.map((k) => `data.*.${k}`)]];

  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(): Promise<ResultInterface> {
    const data = await this.territoryRepository.all();

    return {
      data,
      meta: { total: data.length },
    };
  }
}
