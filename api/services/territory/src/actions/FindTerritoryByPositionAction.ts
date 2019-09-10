import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { CreateTerritoryParamsInterface, TerritoryInterface } from '@pdc/provider-schema';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';

@handler({
  service: 'territory',
  method: 'findByPosition',
})
export class FindTerritoryByPositionAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    // TODO: middlewares !!!
  ];

  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(data: { lat: Number; lon: Number }): Promise<TerritoryInterface> {
    return this.territoryRepository.findByPosition(data.lon, data.lat);
  }
}
