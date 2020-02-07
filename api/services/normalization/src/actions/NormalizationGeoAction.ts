import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { GeoProviderInterfaceResolver } from '@pdc/provider-geo';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/normalization/geo.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';

// Enrich position data
@handler(handlerConfig)
export class NormalizationGeoAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['channel.service.only', ['acquisition', handlerConfig.service]]];

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
