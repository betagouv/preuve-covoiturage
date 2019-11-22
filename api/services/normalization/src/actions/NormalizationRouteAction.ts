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
  public readonly middlewares: ActionMiddleware[] = [['channel.transport', ['queue']]];

  constructor(protected wf: WorkflowProvider, private geoProvider: GeoProviderInterfaceResolver) {
    super();
  }

  public async handle(journey: ParamsInterface): Promise<ResultInterface> {
    this.logger.debug(`Normalization:route on ${journey._id}`);

    // calc distance and duration for passenger
    const passengerRoute = await this.geoProvider.getRouteMeta(
      {
        lon: journey.payload.passenger.start.lon,
        lat: journey.payload.passenger.start.lat,
      },
      {
        lon: journey.payload.passenger.end.lon,
        lat: journey.payload.passenger.end.lat,
      },
    );

    set(journey, 'payload.passenger.calc_distance', passengerRoute.distance);
    set(journey, 'payload.passenger.calc_duration', passengerRoute.duration);

    // calc distance and duration for driver
    const driverRoute = await this.geoProvider.getRouteMeta(
      {
        lon: journey.payload.driver.start.lon,
        lat: journey.payload.driver.start.lat,
      },
      {
        lon: journey.payload.driver.end.lon,
        lat: journey.payload.driver.end.lat,
      },
    );

    set(journey, 'payload.driver.calc_distance', driverRoute.distance);
    set(journey, 'payload.driver.calc_duration', driverRoute.duration);

    // Call the next step asynchronously
    await this.wf.next('normalization:route', journey);

    return journey;
  }
}
