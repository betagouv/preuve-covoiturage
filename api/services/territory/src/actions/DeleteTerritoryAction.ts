import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';

@handler({
  service: 'territory',
  method: 'delete',
})
export class DeleteTerritoryAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['can', ['territory.delete']],
    ['validate', 'territory.delete'],
  ];

  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: { _id: string }): Promise<boolean> {
    await this.territoryRepository.delete(params._id);
    return true;
  }
}
