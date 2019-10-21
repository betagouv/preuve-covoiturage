import { JourneyInterface } from '@pdc/provider-schema';

export interface WhiteListedJourneyInterface {
  _id?: string;
  journey_id: string;
  created_at: Date;
}

export interface JourneyRepositoryProviderInterface {
  create(journey: JourneyInterface): Promise<WhiteListedJourneyInterface>;
}

export abstract class JourneyRepositoryProviderInterfaceResolver implements JourneyRepositoryProviderInterface {
  async create(journey: JourneyInterface): Promise<WhiteListedJourneyInterface> {
    throw new Error();
  }
}
