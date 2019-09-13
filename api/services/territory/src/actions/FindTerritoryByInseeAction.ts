import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { TerritoryInterface } from '@pdc/provider-schema';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { blacklist } from '../config/filterOutput';

@handler({
  service: 'territory',
  method: 'findByInsee',
})
export class FindTerritoryByInseeAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'territory.findByInsee'],
    ['content.blacklist', blacklist],
  ];

  constructor(private territoryRepository: TerritoryRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(data: { insee: String }): Promise<TerritoryInterface> {
    return this.territoryRepository.findByInsee(data.insee);
  }
}
