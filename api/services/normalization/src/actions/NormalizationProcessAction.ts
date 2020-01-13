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
import { PersonInterface } from '../shared/common/interfaces/PersonInterface';
import { PaymentInterface } from '../shared/common/interfaces/PaymentInterface';

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

    // Identity ------------------------------------------------------------------------------------

    finalPerson.identity = await this.kernel.call<IdentityParamsInterface, IdentityResultInterface>(
      identitySignature,
      finalPerson.identity,
      context,
    );

    // Geo ------------------------------------------------------------------------------------

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

    // Territory ------------------------------------------------------------------------------------

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

    return finalPerson;
  }
}
