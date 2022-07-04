import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { copyFromContextMiddleware, hasPermissionMiddleware } from '@pdc/provider-middleware';

import { GeoRepositoryProviderInterfaceResolver } from '../../interfaces/GeoRepositoryProviderInterface';
import { handlerConfig, ResultInterface, ParamsInterface } from '../../shared/territory/findGeoByName.contract';
import { alias } from '../../shared/territory/findGeoByName.schema';

@handler({
  ...handlerConfig,
  middlewares: [
    hasPermissionMiddleware('common.territory.list'),
    // set the on_territories to own authorizedZoneCodes  when user is a territory
    copyFromContextMiddleware('call.user.authorizedZoneCodes.com', 'where.insee'),
    ['validate', alias],
  ],
})
export class FindGeoByNameAction extends AbstractAction {
  constructor(private geoRepository: GeoRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.geoRepository.findByName(params);
  }
}
