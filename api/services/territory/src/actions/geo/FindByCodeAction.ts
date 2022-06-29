import { handler } from '@ilos/common';
import { Action as AbstractAction } from '@ilos/core';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';

import { GeoRepositoryProviderInterfaceResolver } from '../../interfaces/GeoRepositoryProviderInterface';
import { handlerConfig, ResultInterface, ParamsInterface } from '../../shared/territory/findGeoByCode.contract';

@handler({
  ...handlerConfig,
  middlewares: [...internalOnlyMiddlewares('policy')],
})
export class FindGeoByNameAction extends AbstractAction {
  constructor(private geoRepository: GeoRepositoryProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return this.geoRepository.findByCode(params);
  }
}
