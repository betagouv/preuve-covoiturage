import { Action as AbstractAction } from '@ilos/core';
import { handler, KernelInterfaceResolver } from '@ilos/common';

import { TerritoryRepositoryProviderInterfaceResolver } from '../interfaces/TerritoryRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/territory/delete.contract';
import { alias } from '../shared/territory/delete.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    ['can', ['territory.delete']],
    ['validate', alias],
  ],
})
export class DeleteTerritoryAction extends AbstractAction {
  constructor(
    private kernel: KernelInterfaceResolver,
    private territoryRepository: TerritoryRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    await this.territoryRepository.delete(params._id);
    await this.kernel.call(
      'user:deleteAssociated',
      {
        territory_id: params._id,
      },
      {
        channel: { service: 'territory' },
      },
    );
  }
}
