import { Action as AbstractAction } from '@/ilos/core/index.ts';
import { handler, KernelInterfaceResolver } from '@/ilos/common/index.ts';
import { hasPermissionMiddleware } from '@/pdc/providers/middleware/index.ts';

import { TerritoryRepositoryProviderInterfaceResolver } from '../../interfaces/TerritoryRepositoryProviderInterface.ts';
import { handlerConfig, ParamsInterface, ResultInterface } from '@/shared/territory/delete.contract.ts';
import { alias } from '@/shared/territory/delete.schema.ts';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('registry.territory.delete'), ['validate', alias]],
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
