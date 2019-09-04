import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver } from '@ilos/common';
import { CreateJourneyParamsInterface, PersonInterface } from '@pdc/provider-schema';

import { Journey } from '../entities/Journey';
import { JourneyRepositoryProviderInterfaceResolver } from '../interfaces/JourneyRepositoryProviderInterface';

const context = {
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
    private journeyRepository: JourneyRepositoryProviderInterfaceResolver,
    private kernel: KernelInterfaceResolver,
  ) {
    super();
  }

  protected async handle(
    params: CreateJourneyParamsInterface | CreateJourneyParamsInterface[],
    context: ContextType,
  ): Promise<Journey | Journey[]> {
    // TODO 5 days delay !!!
    let result: Journey | Journey[];

    if (Array.isArray(params)) {
      const journeys = params.map((journeyData) => this.cast(journeyData, context.call.user.operator_id));
      result = await this.journeyRepository.createMany(journeys);
      const promises: Promise<void>[] = [];
      for (const journey of journeys) {
        promises.push(this.kernel.notify('normalization:geo', journey, context));
      }
      await Promise.all(promises);
    } else {
      result = await this.journeyRepository.create(this.cast(params, context.call.user.operator_id));
      await this.kernel.notify('normalization:geo', result, context);
    }
    return result;
  }

  protected cast(journey: CreateJourneyParamsInterface, operator_id: string): Journey {
    return new Journey({
      ...journey,
      operator_id,
      driver: this.castPerson(journey.driver, true),
      passenger: this.castPerson(journey.passenger, false),
      created_at: new Date(),
    });
  }

  protected castPerson(person: PersonInterface, driver = false): PersonInterface {
    return {
      distance: 0,
      duration: 0,
      incentive: 0,
      contribution: 0,
      revenue: 0,
      expense: 0,
      incentives: [],
      payments: [],
      ...person,
      is_driver: driver,
      seats: 'seats' in person ? person.seats : !driver ? 1 : 0,
    };
  }
}
