import { Parents, Container } from '@pdc/core';

@Container.handler({
  service: 'acquisition',
  method: 'createJourney',
})
export class CreateJourneyAction extends Parents.Action {
  constructor(
  ) {
    super();
  }

  protected async handle(): Promise<void> {
    
  }
}
