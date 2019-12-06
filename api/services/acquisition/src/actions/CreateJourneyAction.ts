import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver, ParseErrorException, ConflictException } from '@ilos/common';
import { CreateJourneyParamsInterface, PersonInterface } from '@pdc/provider-schema';

import { Journey } from '../entities/Journey';
import { JourneyRepositoryProviderInterfaceResolver } from '../interfaces/JourneyRepositoryProviderInterface';

interface WhiteListedJourney {
  journey_id: string;
  created_at: Date;
}

const callContext = {
  channel: {
    service: 'acquisition',
  },
  call: {
    user: {},
  },
};

@handler({
  service: 'acquisition',
  method: 'create',
})
export class CreateJourneyAction extends AbstractAction {
  public readonly middlewares: (string | [string, any])[] = [
    ['can', ['journey.create']],
    ['validate', 'journey.create'],
  ];

  constructor(
    private kernel: KernelInterfaceResolver,
    private journeyRepository: JourneyRepositoryProviderInterfaceResolver,
  ) {
    super();
  }

  protected async handle(
    params: CreateJourneyParamsInterface,
    context: ContextType,
  ): Promise<WhiteListedJourney | WhiteListedJourney[]> {
    const now = new Date();

    // assign the operator from context
    const payload: Journey = this.cast(params, context.call.user.operator);

    // reject if happening in the future
    const person = 'passenger' in payload ? payload.passenger : payload.driver;
    if (person.start.datetime > now || person.end.datetime > now) {
      throw new ParseErrorException('Journeys cannot happen in the future');
    }

    // Store in database
    try {
      const journey = await this.journeyRepository.create(payload);

      // Dispatch to the normalization pipeline
      await this.kernel.notify('normalization:geo', journey, callContext);

      return {
        journey_id: journey.journey_id,
        created_at: journey.created_at,
      };
    } catch (e) {
      switch (e.code) {
        case 11000:
          throw new ConflictException('Journey already registered');
        default:
          throw e;
      }
    }
  }

  protected cast(jrn: CreateJourneyParamsInterface, operatorId: string): Journey {
    const journey = new Journey({
      ...jrn,
      journey_id: `${operatorId}:${jrn.journey_id}`,
      operator_id: operatorId,
      created_at: new Date(),
    });

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
