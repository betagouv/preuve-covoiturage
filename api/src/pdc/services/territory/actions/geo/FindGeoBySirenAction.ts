import { hasPermissionMiddleware, contentBlacklistMiddleware } from '@pdc/providers/middleware';
import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';

import { GeoRepositoryProviderInterfaceResolver } from '../../interfaces/GeoRepositoryProviderInterface';
import { handlerConfig, ParamsInterface, ResultInterface } from '@shared/territory/findGeoBySiren.contract';
import { alias } from '@shared/territory/findGeoBySiren.schema';
import { blacklist } from '../../config/filterOutput';

@handler({
  ...handlerConfig,
  middlewares: [
    hasPermissionMiddleware('common.territory.list'),
    ['validate', alias],
    contentBlacklistMiddleware(...blacklist),
  ],
})
export class FindGeoBySirenAction extends AbstractAction {
  constructor(private geoRepository: GeoRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.geoRepository.findBySiren(params);
  }
}
