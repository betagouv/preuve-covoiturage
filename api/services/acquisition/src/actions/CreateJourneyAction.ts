import { Parents, Container, Types } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

import { Journey } from '../entities/Journey';
import { JourneyRepositoryProviderInterfaceResolver } from '../interfaces/JourneyRepositoryProviderInterface';
import { CreateJourneyParamsInterface } from '../interfaces/CreateJourneyParamsInterface';

@Container.handler({
  service: 'acquisition',
  method: 'create',
})
export class CreateJourneyAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [
    ['validate', 'journey.create'],
    ['can', ['journey.create']],
  ];

  constructor(
    private journeyRepository: JourneyRepositoryProviderInterfaceResolver,
    private configProvider: ConfigProviderInterfaceResolver,
  ) {
    super();
  }

  protected get costByKm(): number {
    return this.configProvider.get('acquisition.costByKm');
  }

  protected async handle(
    params: CreateJourneyParamsInterface | CreateJourneyParamsInterface[],
    context: Types.ContextType,
  ): Promise<Journey | Journey[]> {
    if (Array.isArray(params)) {
      const journeys = params.map((journeyData) => this.cast(journeyData, context.call.user.operator_id));
      return this.journeyRepository.createMany(journeys);
    }

    return this.journeyRepository.create(this.cast(params, context.call.user.operator_id));
  }

  // tslint:disable-next-line: variable-name
  protected cast(journey: CreateJourneyParamsInterface, operator_id: string): Journey {
    // TODO calculate driverExpense, passengerExpense using incentives[]

    const driverExpense = 0;
    const passengerExpense = 0;

    return new Journey({
      ...journey,
      operator_id,
      driver: {
        ...journey.driver,
        expense: driverExpense,
      },
      passenger: {
        ...journey.passenger,
        expense: passengerExpense,
      },
    });
  }
}
