import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { GeoProviderInterfaceResolver } from '@pdc/provider-geo';
import { internalOnlyMiddlewares } from '@pdc/provider-middleware';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/normalization/geo.contract';

@handler({ ...handlerConfig, middlewares: [...internalOnlyMiddlewares(handlerConfig.service)] })
export class NormalizationGeoAction extends AbstractAction {
  constructor(private geoProvider: GeoProviderInterfaceResolver) {
    super();
  }

  public async handle(params: ParamsInterface): Promise<ResultInterface> {
    return {
      start: await this.geoProvider.checkAndComplete(params.start),
      end: await this.geoProvider.checkAndComplete(params.end),
    };
  }
}
