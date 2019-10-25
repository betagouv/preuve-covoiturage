import { JourneyInterface } from '../shared/common/interfaces/JourneyInterface';

export interface JourneyRepositoryProviderInterface {
  create(journey: JourneyInterface): Promise<JourneyInterface>;
  createMany(journeys: JourneyInterface[]): Promise<JourneyInterface[]>;
}

export abstract class JourneyRepositoryProviderInterfaceResolver implements JourneyRepositoryProviderInterface {
  async create(journey: JourneyInterface): Promise<JourneyInterface> {
    throw new Error();
  }
  async createMany(journeys: JourneyInterface[]): Promise<JourneyInterface[]> {
    throw new Error();
  }
}
