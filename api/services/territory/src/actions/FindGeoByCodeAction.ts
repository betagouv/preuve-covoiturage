// Old API : TODO: remove after complete service migration
import { hasPermissionMiddleware, contentBlacklistMiddleware } from '@pdc/provider-middleware';
import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { GeoRepositoryProviderInterfaceResolver } from '../interfaces/GeoRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/territory/findGeoByCode.contract';
import { alias } from '../shared/territory/findGeoByCode.schema';
import { blacklist } from '../config/filterOutput';

@handler({
  ...handlerConfig,
  middlewares: [
    hasPermissionMiddleware('common.territory.list'),
    ['validate', alias],
    contentBlacklistMiddleware(...blacklist),
  ],
})
export class FindGeoByCodeAction extends AbstractAction {
  constructor(private geoRepository: GeoRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.geoRepository.findByCodes(params);
  }
}
