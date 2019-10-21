import { JourneyInterface } from '@pdc/provider-schema';

export interface JourneyRepositoryProviderInterface {
  createMany(journeys: JourneyInterface[]): Promise<JourneyInterface[]>;
}

export abstract class JourneyRepositoryProviderInterfaceResolver implements JourneyRepositoryProviderInterface {
  async createMany(journeys: JourneyInterface[]): Promise<JourneyInterface[]> {
    throw new Error();
  }
}
