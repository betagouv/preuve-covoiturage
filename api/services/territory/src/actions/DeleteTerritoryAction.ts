import { Parents, Container } from '@ilos/core';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';

@Container.handler({
  service: 'territory',
  method: 'delete',
})
export class DeleteTerritoryAction extends Parents.Action {
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
