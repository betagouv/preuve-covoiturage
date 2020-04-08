import { Action as AbstractAction } from '@ilos/core';
import { handler, KernelInterfaceResolver, ContextType } from '@ilos/common';
import { ParamsInterface as LogErrorParamsInterface } from '../shared/acquisition/logerror.contract';
import { ParamsInterface as ResolveErrorParamsInterface } from '../shared/acquisition/resolveerror.contract';

import {
  signature as costSignature,
  ParamsInterface as CostParamsInterface,
  ResultInterface as CostResultInterface,
} from '../shared/normalization/cost.contract';
import {
  signature as identitySignature,
  ParamsInterface as IdentityParamsInterface,
  ResultInterface as IdentityResultInterface,
} from '../shared/normalization/identity.contract';
import {
  signature as geoSignature,
  ParamsInterface as GeoParamsInterface,
  ResultInterface as GeoResultInterface,
} from '../shared/normalization/geo.contract';
import {
  signature as routeSignature,
  ParamsInterface as RouteParamsInterface,
  ResultInterface as RouteResultInterface,
} from '../shared/normalization/route.contract';
import {
  signature as territorySignature,
  ParamsInterface as TerritoryParamsInterface,
  ResultInterface as TerritoryResultInterface,
} from '../shared/normalization/territory.contract';
import {
  signature as crossCheckSignature,
  ParamsInterface as CrossCheckParamsInterface,
  ResultInterface as CrossCheckResultInterface,
} from '../shared/carpool/crosscheck.contract';
import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/normalization/process.contract';
import { PersonInterface, FinalizedPersonInterface } from '../shared/common/interfaces/PersonInterface';
import { ErrorStage } from '../shared/acquisition/common/interfaces/AcquisitionErrorInterface';

const context: ContextType = {
  call: {
    user: {},
  },
  channel: {
    service: 'normalization',
    transport: 'queue',
  },
};

enum NormalisationErrorStage {
  Cost = 'cost',
  Identity = 'identity',
  Geo = 'geo',
  GeoRoute = 'geo.route',
  Territory = 'territory',
}

// Enrich position data
@handler({ ...handlerConfig, middlewares: [['channel.service.only', ['acquisition', handlerConfig.service]]] })
export class NormalizationProcessAction extends AbstractAction {
  constructor(private kernel: KernelInterfaceResolver) {
    super();
  }

  public async handle(journey: ParamsInterface): Promise<ResultInterface> {
    const normalizedJourney: ResultInterface = { ...journey };
    const people: FinalizedPersonInterface[] = [];

    if (journey.payload.driver) {
      normalizedJourney.payload.driver = await this.handlePerson(journey.payload.driver, journey);
      people.push(this.finalizePerson(normalizedJourney.payload.driver));
    }
    if (journey.payload.passenger) {
      normalizedJourney.payload.passenger = await this.handlePerson(journey.payload.passenger, journey);
      people.push(this.finalizePerson(journey.payload.passenger));
    }

    const normalizedData: CrossCheckParamsInterface = {
      people,
      operator_trip_id: journey.payload.operator_journey_id,
      created_at: journey.created_at,
      operator_id: journey.operator_id,
      operator_class: journey.payload.operator_class,
      acquisition_id: journey._id,
      operator_journey_id: journey.journey_id,
    };

    // mark all previously attempted normalisation failed request as resolved
    this.kernel.notify<ResolveErrorParamsInterface>(
      'acquisition:resolveerror',
      {
        operator_id: journey.operator_id,
        journey_id: journey.journey_id,
        error_stage: ErrorStage.Normalisation,
      },
      { channel: { service: 'acquisition' } },
    );

    await this.kernel.call<CrossCheckParamsInterface, CrossCheckResultInterface>(
      crossCheckSignature,
      normalizedData,
      context,
    );

    return normalizedJourney;
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
        insee: person.start.insee,
      },
      end: {
        lon: person.end.lon,
        lat: person.end.lat,
        insee: person.end.insee,
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
    journey: ParamsInterface,
    e: Error,
    errorCode = '500',
  ): Promise<void> {
    await this.kernel.notify<LogErrorParamsInterface>(
      'acquisition:logerror',
      {
        error_stage: ErrorStage.Normalisation,
        error_line: null,
        operator_id: journey.operator_id,
        journey_id: journey.journey_id,
        source: 'api.v2',
        error_message: e.message,
        error_code: errorCode,
        auth: {},
        headers: {},
        body: { journey, normalisationCode },
      },
      { channel: { service: 'acquisition' } },
    );
  }

  public async handlePerson(person: PersonInterface, journey: ParamsInterface): Promise<PersonInterface> {
    const finalPerson: PersonInterface = { ...person };

    // Cost ------------------------------------------------------------------------------------

    try {
      const { cost, payments } = await this.kernel.call<CostParamsInterface, CostResultInterface>(
        costSignature,
        {
          operator_id: journey.operator_id,
          revenue: finalPerson.revenue,
          contribution: finalPerson.contribution,
          incentives: finalPerson.incentives,
          payments: finalPerson.payments,
          isDriver: finalPerson.is_driver as boolean,
        },
        context,
      );

      finalPerson['cost'] = cost;
      finalPerson.payments = payments;
    } catch (e) {
      await this.logError(NormalisationErrorStage.Cost, journey, e);

      // throw e;
    }

    // Identity ------------------------------------------------------------------------------------

    try {
      finalPerson.identity = await this.kernel.call<IdentityParamsInterface, IdentityResultInterface>(
        identitySignature,
        finalPerson.identity,
        context,
      );
    } catch (e) {
      await this.logError(NormalisationErrorStage.Identity, journey, e);
      throw e;
    }

    // Geo ------------------------------------------------------------------------------------
    let isSubGeoError = false;
    try {
      const { start, end } = await this.kernel.call<GeoParamsInterface, GeoResultInterface>(
        geoSignature,
        {
          start: finalPerson.start,
          end: finalPerson.end,
        },
        context,
      );

      finalPerson.start = { ...finalPerson.start, ...start };
      finalPerson.end = { ...finalPerson.end, ...end };

      // Route ------------------------------------------------------------------------------------
      try {
        const { calc_distance, calc_duration } = await this.kernel.call<RouteParamsInterface, RouteResultInterface>(
          routeSignature,
          {
            start,
            end,
          },
          context,
        );

        finalPerson.calc_distance = calc_distance;
        finalPerson.calc_duration = calc_duration;
      } catch (e) {
        await this.logError(NormalisationErrorStage.GeoRoute, journey, e);
        isSubGeoError = true;

        throw e;
      }
    } catch (e) {
      if (!isSubGeoError) await this.logError(NormalisationErrorStage.Geo, journey, e);

      throw e;
    }

    // Territory ------------------------------------------------------------------------------------
    try {
      const territories = await this.kernel.call<TerritoryParamsInterface, TerritoryResultInterface>(
        territorySignature,
        {
          start: finalPerson.start,
          end: finalPerson.end,
        },
        context,
      );

      finalPerson.start.territory_id = territories.start;
      finalPerson.end.territory_id = territories.end;
    } catch (e) {
      await this.logError(NormalisationErrorStage.Territory, journey, e);

      throw e;
    }

    return finalPerson;
  }
}
