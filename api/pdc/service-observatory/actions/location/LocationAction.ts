import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { hasPermissionMiddleware } from '@pdc/provider-middleware';

import { alias } from '../../shared/observatory/location/location.schema';
import { handlerConfig, ResultInterface, ParamsInterface } from '../../shared/observatory/location/location.contract';
import { LocationRepositoryInterfaceResolver } from '../../interfaces/LocationRepositoryProviderInterface';

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
