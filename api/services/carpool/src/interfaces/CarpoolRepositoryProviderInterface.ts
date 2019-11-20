import { AcquisitionInterface } from '../shared/acquisition/common/interfaces/AcquisitionInterface';

export interface CarpoolRepositoryProviderInterface {
  importJourney(journey: AcquisitionInterface): Promise<void>;
}
export abstract class CarpoolRepositoryProviderInterfaceResolver implements CarpoolRepositoryProviderInterface {
  public async importJourney(journey: AcquisitionInterface): Promise<void> {
    throw new Error();
  }
}
