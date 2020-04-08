import { get } from 'lodash';
import { Action as AbstractAction } from '@ilos/core';
import {
  handler,
  ContextType,
  KernelInterfaceResolver,
  ParseErrorException,
  ConflictException,
  ValidatorInterfaceResolver,
  InvalidParamsException,
} from '@ilos/common';

import { handlerConfig, ParamsInterface, ResultInterface } from '../shared/acquisition/create.contract';
import { alias } from '../shared/acquisition/create.schema';
import { JourneyInterface } from '../shared/common/interfaces/JourneyInterface';
import { PersonInterface } from '../shared/common/interfaces/PersonInterface';
import { ParamsInterface as LogErrorParamsInterface } from '../shared/acquisition/logerror.contract';
import { JourneyRepositoryProviderInterfaceResolver } from '../interfaces/JourneyRepositoryProviderInterface';
import { ErrorStage } from '../shared/acquisition/common/interfaces/AcquisitionErrorInterface';
import { ParamsInterface as ResolveErrorParamsInterface } from '../shared/acquisition/resolveerror.contract';
import { AcquisitionInterface } from '../shared/acquisition/common/interfaces/AcquisitionInterface';

const callContext: ContextType = {
  channel: {
    service: 'acquisition',
    metadata: {
      attempts: 5,
      backoff: 300000, // 5 min delay between attempts
    },
  },
  call: {
    user: {},
  },
};

@handler({ ...handlerConfig, middlewares: [['can', ['journey.create']]] })
export class CreateJourneyAction extends AbstractAction {
  constructor(
    private kernel: KernelInterfaceResolver,
    private journeyRepository: JourneyRepositoryProviderInterfaceResolver,
    private validator: ValidatorInterfaceResolver,
  ) {
    super();
  }

  protected async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const now = new Date();

    // validate the payload manually to log rejected journeys
    try {
      await this.validator.validate(params, alias);
    } catch (e) {
      await this.kernel.notify<LogErrorParamsInterface>(
        'acquisition:logerror',
        {
          error_stage: ErrorStage.Acquisition,
          error_line: null,
          operator_id: get(context, 'call.user.operator_id', 0),
          journey_id: params.journey_id,
          source: 'api.v2',
          error_message: e.message,
          error_code: '400',
          auth: get(context, 'call.user'),
          headers: get(context, 'call.metadata.req.headers', {}),
          body: params,
        },
        { channel: { service: 'acquisition' } },
      );

      throw new InvalidParamsException(e.message);
    }

    // assign the operator from context
    const payload: JourneyInterface = this.cast(params, context.call.user.operator_id);

    // reject if happening in the future
    const person = 'passenger' in payload ? payload.passenger : payload.driver;
    if (person.start.datetime > now || person.end.datetime > now) {
      throw new ParseErrorException('Journeys cannot happen in the future');
    }
    let acquisition: AcquisitionInterface;

    // Store in database
    try {
      acquisition = await this.journeyRepository.create(payload, {
        operator_id: context.call.user.operator_id,
        application_id: context.call.user.application_id,
      });
    } catch (e) {
      await this.kernel.notify<LogErrorParamsInterface>(
        'acquisition:logerror',
        {
          error_stage: ErrorStage.Acquisition,
          error_line: null,
          operator_id: get(context, 'call.user.operator_id', 0),
          journey_id: params.journey_id,
          source: 'api.v2',
          error_message: e.message,
          error_code: '500',
          auth: get(context, 'call.user'),
          headers: get(context, 'call.metadata.req.headers', {}),
          body: params,
        },
        { channel: { service: 'acquisition' } },
      );

      switch (e.code) {
        case '23505':
          throw new ConflictException('Journey already registered');
        default:
          throw e;
      }
    }

    this.kernel.notify<ResolveErrorParamsInterface>(
      'acquisition:resolveerror',
      {
        operator_id: get(context, 'call.user.operator_id', 0),
        journey_id: params.journey_id,
        error_stage: ErrorStage.Normalisation,
      },
      { channel: { service: 'acquisition' } },
    );

    await this.kernel.notify('normalization:process', acquisition, callContext);

    return {
      journey_id: acquisition.journey_id,
      created_at: acquisition.created_at,
    };
  }

  protected cast(jrn: ParamsInterface, operator_id: number): JourneyInterface {
    const journey = {
      ...jrn,
      operator_id,
    };

    // driver AND/OR passenger
    if ('driver' in jrn) journey.driver = this.castPerson(jrn.driver, true);
    if ('passenger' in jrn) journey.passenger = this.castPerson(jrn.passenger, false);

    return journey;
  }

  protected castPerson(person: PersonInterface, driver = false): PersonInterface {
    return {
      expense: 0,
      incentives: [],
      payments: [],
      ...person,
      is_driver: driver,
      seats: person && 'seats' in person ? person.seats : !driver ? 1 : 0,
    };
  }
}
