import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { handlerConfig, ResultInterface } from '../shared/territory/list.contract';
import { TerritoryListFilter } from '../shared/territory/common/interfaces/TerritoryQueryInterface';

// TODO : MIDDLEWARE
@handler({
  ...handlerConfig,
  middlewares: [
    // ['validate', 'territory.list'],
    hasPermissionMiddleware('territory.list'),
  ],
})
export class ListTerritoryAction extends AbstractAction {
  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(filter?: TerritoryListFilter): Promise<ResultInterface> {
    const data = await this.territoryRepository.all(
      filter && filter.search ? filter.search : undefined,
      filter && filter.levels ? filter.levels : undefined,
      filter && filter.withParents ? filter.withParents : undefined,
      filter && filter.withLevel ? filter.withLevel : undefined,
      filter && filter.limit ? filter.limit : undefined,
      filter && filter.skip ? filter.skip : undefined,
    );

    const res = {
      data: data.rows,
      meta: {
        pagination: {
          total: data.count,
          offset: filter && filter.skip ? filter.skip : 0,
          limit: filter && filter.limit ? filter.limit : data.count,
        },
      },
    };

    return res;
  }
}
