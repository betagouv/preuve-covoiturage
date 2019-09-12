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
      // /!\ operator_id is stored in user.operator
      .map((journeyData) => this.cast(journeyData, context.call.user.operator))

      // filter out journeys in the future
      .filter((journeyData) => {
        const person = 'driver' in journeyData ? journeyData.driver : journeyData.passenger;
        return person.start.datetime < person.end.datetime && person.end.datetime < now;
      });

    if (journeys.length === 0) return [];

    // store the journeys
    const result: Journey[] = await this.journeyRepository.createMany(journeys);

    // dispatch only journey done 7 days from now
    const sevendaysFromNow = moment()
      .subtract(7, 'days')
      .toDate();

    const journeyToDispatch = result.filter((journey) => {
      const person = 'driver' in journey ? journey.driver : journey.passenger;
      return person.start.datetime >= sevendaysFromNow;
    });

    // dispatch notifications for geo enrichment
    const promises: Promise<void>[] = [];
    for (const journey of journeyToDispatch) {
      promises.push(this.kernel.notify('normalization:geo', journey, callContext));
    }

    await Promise.all(promises);

    return hasMany ? result : result.pop();
  }

  protected cast(jrn: CreateJourneyParamsInterface, operatorId: string): Journey {
    const journey = new Journey({
      ...jrn,
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
