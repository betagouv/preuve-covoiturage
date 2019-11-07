import { set } from 'lodash';
import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType } from '@ilos/common';
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

  public async handle(journey: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    this.logger.debug(`Normalization:route on ${journey._id}`);

    // calc distance and duration for passenger
    const passengerRoute = await this.geoProvider.getRouteMeta(
      {
        lon: journey.passenger.start.lon,
        lat: journey.passenger.start.lat,
      },
      {
        lon: journey.passenger.end.lon,
        lat: journey.passenger.end.lat,
      },
    );

    set(journey, 'passenger.calc_distance', passengerRoute.distance);
    set(journey, 'passenger.calc_duration', passengerRoute.duration);

    // calc distance and duration for driver
    const driverRoute = await this.geoProvider.getRouteMeta(
      {
        lon: journey.driver.start.lon,
        lat: journey.driver.start.lat,
      },
      {
        lon: journey.driver.end.lon,
        lat: journey.driver.end.lat,
      },
    );

    set(journey, 'driver.calc_distance', driverRoute.distance);
    set(journey, 'driver.calc_duration', driverRoute.duration);

    // Call the next step asynchronously
    await this.wf.next('normalization:route', journey);

    return journey;
  }
}
