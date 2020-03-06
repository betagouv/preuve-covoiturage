import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { GeoProviderInterfaceResolver } from '@pdc/provider-geo';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/normalization/route.contract';

// Enrich position data
@handler({ ...handlerConfig, middlewares: [['channel.service.only', ['acquisition', handlerConfig.service]]] })
export class NormalizationRouteAction extends AbstractAction {
  constructor(private geoProvider: GeoProviderInterfaceResolver) {
    super();
  }

  public async handle(payload: ParamsInterface): Promise<ResultInterface> {
    // this.logger.debug(`Normalization:route on ${journey._id}`);

    // calc distance and duration for passenger
    const passengerRoute = await this.geoProvider.getRouteMeta(payload.start, payload.end);
    return {
      calc_distance: Math.floor(passengerRoute.distance),
      calc_duration: Math.floor(passengerRoute.duration),
    };
  }
}
