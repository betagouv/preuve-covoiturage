import { Parents, Container } from '@pdc/core';
import { CreateJourneyParamsInterface } from '../interfaces/JourneyInterfaces';

@Container.handler({
  service: 'acquisition',
  method: 'createJourney',
})
export class CreateJourneyAction extends Parents.Action {
  constructor(
  ) {
    super();
  }

  protected async handle(params: CreateJourneyParamsInterface): Promise<void> {
    
  }
}
