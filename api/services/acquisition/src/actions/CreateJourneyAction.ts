import { Action as AbstractAction } from '@ilos/core';
import { handler, ContextType, KernelInterfaceResolver } from '@ilos/common';
import { CreateJourneyParamsInterface, PersonInterface } from '@pdc/provider-schema';
import moment from 'moment';

import { Journey } from '../entities/Journey';
import { JourneyRepositoryProviderInterfaceResolver } from '../interfaces/JourneyRepositoryProviderInterface';

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
    private journeyRepository: JourneyRepositoryProviderInterfaceResolver,
    private kernel: KernelInterfaceResolver,
  ) {
    super();
  }

  protected async handle(
    params: CreateJourneyParamsInterface | CreateJourneyParamsInterface[],
    context: ContextType,
  ): Promise<Journey | Journey[]> {
    const now = new Date();
    const hasMany = Array.isArray(params);

    const journeys: Journey[] = (Array.isArray(params) ? [...params] : [params])
      .map((journeyData) => this.cast(journeyData, context.call.user.operator_id))

      // avoid time travelling
      .filter(
        (journeyData) =>
          journeyData.driver.start.datetime < journeyData.driver.end.datetime &&
          journeyData.driver.end.datetime < now &&
          journeyData.driver.start.datetime < journeyData.driver.end.datetime &&
          journeyData.driver.end.datetime < now,
      );

    if (journeys.length === 0) {
      return;
    }
    const result: Journey[] = await this.journeyRepository.createMany(journeys);

    // dispatch only journey done 7 days from now
    const sevendaysFromNow = moment()
      .subtract(7, 'days')
      .toDate();
    const journeyToDispatch = result.filter((journey) => journey.driver.start.datetime >= sevendaysFromNow);
    const promises: Promise<void>[] = [];
    for (const journey of journeyToDispatch) {
      promises.push(this.kernel.notify('normalization:geo', journey, callContext));
    }

    await Promise.all(promises);

    if (!hasMany) {
      return result.pop();
    }

    return result;
  }

  protected cast(journey: CreateJourneyParamsInterface, operatorId: string): Journey {
    return new Journey({
      ...journey,
      operator_id: operatorId,
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
      seats: person && 'seats' in person ? person.seats : !driver ? 1 : 0,
    };
  }
}
