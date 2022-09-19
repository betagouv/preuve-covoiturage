import { provider } from '@ilos/common';

import { PersonInterface, FinalizedPersonInterface } from '../shared/common/interfaces/PersonInterface';
import { CostNormalizerProvider } from './CostNormalizerProvider';
import { GeoNormalizerProvider } from './GeoNormalizerProvider';
import { IdentityNormalizerProvider } from './IdentityNormalizerProvider';
import { RouteNormalizerProvider } from './RouteNormalizerProvider';
import { NormalizationProviderInterface, ParamsInterface, ResultInterface } from '../interfaces';

enum NormalisationErrorStage {
  Cost = 'cost',
  Identity = 'identity',
  Geo = 'geo',
  GeoRoute = 'geo.route',
  Territory = 'territory',
}

@provider()
export class NormalizationProvider implements NormalizationProviderInterface {
  constructor(
    protected costNormalizer: CostNormalizerProvider,
    protected geoNormalizer: GeoNormalizerProvider,
    protected identityNormalizer: IdentityNormalizerProvider,
    protected routeNormalizer: RouteNormalizerProvider,
  ) {}

  public async handle(journey: ParamsInterface): Promise<ResultInterface> {
    const people: FinalizedPersonInterface[] = [];

    if (journey.payload.driver) {
      const driver = await this.handlePerson(journey.payload.driver, journey);
      people.push(this.finalizePerson(driver));
    }
    if (journey.payload.passenger) {
      const passenger = await this.handlePerson(journey.payload.passenger, journey);
      people.push(this.finalizePerson(passenger));
    }

    const normalizedData: ResultInterface = {
      people,
      operator_trip_id: journey.payload.operator_journey_id,
      created_at: journey.created_at,
      operator_id: journey.operator_id,
      operator_class: journey.payload.operator_class,
      acquisition_id: journey._id,
      operator_journey_id: journey.payload.journey_id,
    };

    return normalizedData;
  }

  public finalizePerson(person: PersonInterface): FinalizedPersonInterface {
    const driverStart = person.start.datetime;
    const driverEnd = person.end.datetime;
    const driverDuration = Math.floor(
      ((driverEnd.getTime ? driverEnd.getTime() : new Date(driverEnd).getTime()) -
        (driverStart.getTime ? driverStart.getTime() : new Date(driverStart).getTime())) /
        1000,
    );

    return {
      is_driver: !!person.is_driver,
      identity: person.identity,
      datetime: person.start.datetime,
      start: {
        lon: person.start.lon,
        lat: person.start.lat,
        geo_code: person.start.geo_code,
      },
      end: {
        lon: person.end.lon,
        lat: person.end.lat,
        geo_code: person.end.geo_code,
      },
      seats: person.seats || 0,
      duration: driverDuration,
      distance: person.distance,
      cost: person.cost,
      meta: {
        payments: [...person.payments],
        calc_distance: person.calc_distance,
        calc_duration: person.calc_duration,
      },
    };
  }

  public async logError(
    normalisationCode: NormalisationErrorStage,
    e: Error,
    _journey?: ParamsInterface,
  ): Promise<void> {
    console.debug(`[normalization]:${normalisationCode}: ${e.message}`, e);
  }

  public async handlePerson(person: PersonInterface, journey: ParamsInterface): Promise<PersonInterface> {
    const finalPerson: PersonInterface = { ...person };

    // Cost ------------------------------------------------------------------------------------

    try {
      const { cost, payments } = await this.costNormalizer.handle({
        operator_id: journey.operator_id,
        revenue: finalPerson.revenue,
        contribution: finalPerson.contribution,
        incentives: finalPerson.incentives,
        payments: finalPerson.payments,
        isDriver: finalPerson.is_driver as boolean,
      });

      finalPerson['cost'] = cost;
      finalPerson.payments = payments;
    } catch (e) {
      await this.logError(NormalisationErrorStage.Cost, e, journey);
      throw e;
    }

    // Identity ------------------------------------------------------------------------------------

    try {
      finalPerson.identity = await this.identityNormalizer.handle(finalPerson.identity);
    } catch (e) {
      await this.logError(NormalisationErrorStage.Identity, e, journey);
      throw e;
    }

    // Geo ------------------------------------------------------------------------------------
    let isSubGeoError = false;
    try {
      const { start, end } = await this.geoNormalizer.handle({
        start: finalPerson.start,
        end: finalPerson.end,
      });

      finalPerson.start = { ...finalPerson.start, ...start };
      finalPerson.end = { ...finalPerson.end, ...end };

      // Route ------------------------------------------------------------------------------------
      try {
        const { calc_distance, calc_duration } = await this.routeNormalizer.handle({
          start,
          end,
        });

        finalPerson.calc_distance = calc_distance;
        finalPerson.calc_duration = calc_duration;
      } catch (e) {
        await this.logError(NormalisationErrorStage.GeoRoute, e, journey);
        isSubGeoError = true;
        throw e;
      }
    } catch (e) {
      if (!isSubGeoError) await this.logError(NormalisationErrorStage.Geo, e, journey);
      throw e;
    }

    return finalPerson;
  }
}
