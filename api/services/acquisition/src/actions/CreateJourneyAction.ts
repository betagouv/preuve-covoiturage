import { Parents, Container, Types } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

import { CreateJourneyParamsInterface } from '../interfaces/JourneyInterfaces';
import { JourneyRepositoryProviderInterfaceResolver } from '../interfaces/JourneyRepositoryProviderInterface';
import { Journey } from '../entities/Journey';

@Container.handler({
  service: 'acquisition',
  method: 'createJourney',
})
export class CreateJourneyAction extends Parents.Action {
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
  ): Promise<void> {
    const operator = {
      _id: context.call.user.operator,
      name: context.call.user.operator_name,
    };

    if (Array.isArray(params)) {
      const journeys = params.map((journeyData) => this.cast(journeyData, operator));
      await this.journeyRepository.createMany(journeys);
      return;
    }

    await this.journeyRepository.create(this.cast(params, operator));
    return;
  }

  protected cast(journey: CreateJourneyParamsInterface, operator: { name: string; _id: string }): Journey {
    const driverExpense: number = Math.round(journey.driver.distance * this.costByKm * 100);
    const driverCost: number = driverExpense - journey.driver.revenue;
    const passengerCost: number = Math.round(journey.passenger.contribution / journey.passenger.seats);

    return new Journey({
      ...journey,
      operator,
      driver: {
        ...journey.driver,
        cost: driverCost,
        incentive: 0,
        remainingFee: driverCost,
        expense: driverExpense,
      },
      passenger: {
        ...journey.passenger,
        cost: passengerCost,
        incentive: 0,
        remainingFee: passengerCost,
      },
    });
  }
}
