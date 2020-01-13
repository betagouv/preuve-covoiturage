import { set } from 'lodash';
import { Action as AbstractAction } from '@ilos/core';
import { handler } from '@ilos/common';
import { GeoProviderInterfaceResolver } from '@pdc/provider-geo';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/normalization/route.contract';
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { WorkflowProvider } from '../providers/WorkflowProvider';

// Enrich position data
@handler(handlerConfig)
export class NormalizationRouteAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['channel.service.only', ['acquisition', handlerConfig.service]]];

  constructor(protected wf: WorkflowProvider, private geoProvider: GeoProviderInterfaceResolver) {
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
