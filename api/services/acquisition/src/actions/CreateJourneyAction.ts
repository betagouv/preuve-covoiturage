import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver, ParseErrorException } from '@ilos/common';

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
  public readonly middlewares: ActionMiddleware[] = [['can', ['journey.create']], ['validate', alias]];

  constructor(
    private kernel: KernelInterfaceResolver,
    private journeyRepository: JourneyRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  protected async handle(params: ParamsInterface, context: ContextType): Promise<ResultInterface> {
    const now = new Date();

    // assign the operator from context
    const payload: JourneyInterface = this.cast(params, context.call.user.operator_id);

    // reject if happening in the future
    const person = 'passenger' in payload ? payload.passenger : payload.driver;
    if (person.start.datetime > now || person.end.datetime > now) {
      throw new ParseErrorException('Journeys cannot happen in the future');
    }

    // Store in database
    const journey = <JourneyInterface & { created_at: Date }>await this.journeyRepository.create(payload);

    // Dispatch to the normalization pipeline
    await this.kernel.notify('normalization:geo', journey, callContext);

    return {
      journey_id: journey.journey_id,
      created_at: journey.created_at,
    };
  }

  protected cast(jrn: ParamsInterface, operatorId: number): JourneyInterface {
    const journey = {
      ...jrn,
      journey_id: `${operatorId}:${jrn.journey_id}`,
      operator_id: operatorId,
      created_at: new Date(),
    };

    // driver AND/OR passenger
    if ('driver' in jrn) journey.driver = this.castPerson(jrn.driver, true);
    if ('passenger' in jrn) journey.passenger = this.castPerson(jrn.passenger, false);

    return journey;
  }

  protected castPerson(person: PersonInterface, driver = false): PersonInterface {
    return {
      distance: 0,
      duration: 0,
      contribution: 0,
      revenue: 0,
      expense: 0,
      incentives: [],
      payments: [],
      ...person,
      is_driver: driver,
      seats: person && 'seats' in person ? person.seats : !driver ? 1 : 0,
    };
  }
}
