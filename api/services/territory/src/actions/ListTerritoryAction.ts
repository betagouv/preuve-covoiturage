import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { blacklist } from '../config/filterOutput';
import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';

@handler({
  service: 'territory',
  method: 'list',
})
export class ListTerritoryAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['content.blacklist', blacklist.map((k) => `data.*.${k}`)],
  ];

  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(): Promise<{ data: any[]; meta: any }> {
    const data = await this.territoryRepository.all();

    return {
      data,
      meta: { total: data.length },
    };
  }
}
