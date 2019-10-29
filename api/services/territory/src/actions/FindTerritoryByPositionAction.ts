import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { TerritoryInterface } from '@pdc/provider-schema';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { blacklist } from '../config/filterOutput';

@handler({
  service: 'territory',
  method: 'findByPosition',
})
export class FindTerritoryByPositionAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'territory.findByPosition'],
    ['content.blacklist', blacklist],
  ];

  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(data: { lat: Number; lon: Number }): Promise<TerritoryInterface> {
    return this.territoryRepository.findByPosition(data.lon, data.lat);
  }
}
