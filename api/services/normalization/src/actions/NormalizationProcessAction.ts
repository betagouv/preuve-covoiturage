import { Action as AbstractAction } from '@ilos/core';
import { handler, KernelInterfaceResolver, ContextType } from '@ilos/common';

import {
  signature as operatorFindSignature,
  ParamsInterface as OperatorFindParamsInterface,
  ResultInterface as OperatorFindResultInterface,
} from '../shared/operator/find.contract';

import {
  signature as crosscheckSignature,
  ParamsInterface as CrosscheckParamsInterface,
  ResultInterface as CrosscheckResultInterface,
} from '../shared/carpool/crosscheck.contract';

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

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/normalization/process.contract';

import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { WorkflowProvider } from '../providers/WorkflowProvider';
import { PersonInterface, FinalizedPersonInterface } from '../shared/common/interfaces/PersonInterface';
import { PaymentInterface } from '../shared/common/interfaces/PaymentInterface';
import { PointInterface } from '@pdc/provider-geo/dist/interfaces';

// Enrich position data
@handler(handlerConfig)
export class NormalisationProcessAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['channel.service.only', ['acquisition', handlerConfig.service]]];

  constructor(private kernel: KernelInterfaceResolver) {
    super();
  }

  public async handle(journey: ParamsInterface): Promise<ResultInterface> {
    const normalizedJourney: ResultInterface = { ...journey };

    if (journey.payload.driver) {
      normalizedJourney.payload.driver = await this.handlePerson(journey.payload.driver, journey);
    }
    if (journey.payload.passenger) {
      normalizedJourney.payload.passenger = await this.handlePerson(journey.payload.driver, journey);
    }

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
      is_driver: true,
      identity: person.identity,
      datetime: person.start.datetime,
      start: {
        lon: person.start.lon,
        lat: person.start.lat,
        insee: person.start.insee,
        datetime: person.start.datetime,
      },
      end: {
        lon: person.end.lon,
        lat: person.end.lat,
        insee: person.end.insee,
        datetime: person.end.datetime,
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

  public async handlePerson(person: PersonInterface, journey: ParamsInterface): Promise<PersonInterface> {
    const finalPerson: PersonInterface = { ...person };

    const context: ContextType = {
      call: {
        user: {},
      },
      channel: {
        service: 'normalization',
        transport: 'queue',
      },
    };

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
      console.error('normalisation ', costSignature, ' failed on ', finalPerson);
      throw e;
    }

    // Identity ------------------------------------------------------------------------------------
    try {
      finalPerson.identity = await this.kernel.call<IdentityParamsInterface, IdentityResultInterface>(
        identitySignature,
        finalPerson.identity,
        context,
      );
    } catch (e) {
      console.error('normalisation ', identitySignature, ' failed on ', finalPerson);
      throw e;
    }

    // Geo ------------------------------------------------------------------------------------
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
        console.error('normalisation ', routeSignature, ' failed on ', finalPerson);
        throw e;
      }
    } catch (e) {
      console.error('normalisation ', geoSignature, ' failed on ', finalPerson);
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
      console.error('normalisation ', territorySignature, ' failed on ', finalPerson);
      throw e;
    }

    return finalPerson;
  }
}
