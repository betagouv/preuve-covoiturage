import { provider } from '@ilos/common';

import { GeoNormalizerProvider } from './GeoNormalizerProvider';
import { RouteNormalizerProvider } from './RouteNormalizerProvider';
import { Acquisition, NormalizationProviderInterface, PayloadV3, ResultInterface } from '../interfaces';

@provider()
export class NormalizationProviderV3 implements NormalizationProviderInterface<PayloadV3> {
  constructor(protected geoNormalizer: GeoNormalizerProvider, protected routeNormalizer: RouteNormalizerProvider) {}

  public async handle(data: Acquisition<PayloadV3>): Promise<ResultInterface> {
    const geoParams = { start: data.payload.start, end: data.payload.end };
    const { start, end } = await this.geoNormalizer.handle(geoParams);
    const { calc_distance, calc_duration } = await this.routeNormalizer.handle(geoParams);
    const duration = Math.floor(
      (new Date(data.payload.end.datetime).getTime() - new Date(data.payload.start.datetime).getTime()) / 1000,
    );
    const cost =
      data.payload.incentive_counterparts
        .filter((i) => i.target === 'passenger')
        .reduce((total, current) => total + current.amount, 0) + data.payload.passenger.contribution;

    const common = {
      start,
      end,
      cost,
      duration,
      datetime: data.payload.start.datetime,
      distance: data.payload.distance,
    };

    const commonMeta = {
      calc_distance,
      calc_duration,
    };

    const driver = {
      ...common,
      identity: data.payload.driver.identity,
      is_driver: true,
      seats: 0,
      payment: data.payload.driver.revenue,
      meta: {
        ...commonMeta,
        incentive_counterparts: data.payload.incentive_counterparts.filter((i) => i.target === 'driver'),
        payments: [],
      },
    };

    const passenger = {
      ...common,
      identity: data.payload.passenger.identity,
      is_driver: false,
      seats: data.payload.passenger.seats || 1,
      payment: data.payload.passenger.contribution,
      meta: {
        ...commonMeta,
        incentive_counterparts: data.payload.incentive_counterparts.filter((i) => i.target === 'passenger'),
        payments: data.payload.passenger.payments || [],
      },
    };

    return {
      operator_trip_id: data.payload.operator_trip_id,
      acquisition_id: data._id,
      operator_id: data.operator_id,
      operator_journey_id: data.payload.operator_journey_id,
      created_at: data.created_at,
      operator_class: data.payload.operator_class,
      incentives: data.payload.incentives,
      people: [driver, passenger],
    };
  }
}
