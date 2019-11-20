import { JourneyInterface } from '../shared/common/interfaces/JourneyInterface';

export interface CarpoolRepositoryProviderInterface {
  importJourney(journey: JourneyInterface): Promise<void>;
}
export abstract class CarpoolRepositoryProviderInterfaceResolver implements CarpoolRepositoryProviderInterface {
  public async importJourney(journey: JourneyInterface): Promise<void> {
    throw new Error();
  }
}
