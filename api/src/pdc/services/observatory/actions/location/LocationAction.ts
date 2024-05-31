import { Action as AbstractAction } from '@ilos/core/index.ts';
import { handler } from '@ilos/common/index.ts';
import { hasPermissionMiddleware } from '@pdc/providers/middleware/index.ts';

import { alias } from '@shared/observatory/location/location.schema.ts';
import { handlerConfig, ResultInterface, ParamsInterface } from '@shared/observatory/location/location.contract.ts';
import { LocationRepositoryInterfaceResolver } from '../../interfaces/LocationRepositoryProviderInterface.ts';

@handler({
  ...handlerConfig,
  middlewares: [hasPermissionMiddleware('common.observatory.stats'), ['validate', alias]],
})
export class LocationAction extends AbstractAction {
  constructor(private repository: LocationRepositoryInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.repository.getLocation(params);
  }
}
