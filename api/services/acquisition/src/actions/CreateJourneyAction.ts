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
import { ActionMiddleware } from '../shared/common/ActionMiddlewareInterface';
import { PersonInterface } from '../shared/common/interfaces/PersonInterface';
import { JourneyRepositoryProviderInterfaceResolver } from '../interfaces/JourneyRepositoryProviderInterface';

const callContext = {
  channel: {
    service: 'acquisition',
  },
  call: {
    user: {},
  },
};

@handler(handlerConfig)
export class CreateJourneyAction extends AbstractAction {
  public readonly middlewares: ActionMiddleware[] = [['can', ['journey.create']]];

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
      await this.kernel.notify(
        'acquisition:logerror',
        {
          operator_id: get(context, 'call.user.operator_id', 0),
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

    // Store in database
    try {
      const acquisition = await this.journeyRepository.create(payload, {
        operator_id: context.call.user.operator_id,
        application_id: context.call.user.application_id,
      });

      // Dispatch to the normalization pipeline
      await this.kernel.notify('normalization:geo', acquisition, callContext);

      return {
        journey_id: acquisition.journey_id,
        created_at: acquisition.created_at,
      };
    } catch (e) {
      switch (e.code) {
        case '23505':
          throw new ConflictException('Journey already registered');
        default:
          throw e;
      }
    }
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
