import { AcquisitionInterface } from '../shared/acquisition/common/interfaces/AcquisitionInterface';
import { JourneyInterface } from '../shared/common/interfaces/JourneyInterface';

export interface JourneyRepositoryProviderInterface {
  create(
    journey: JourneyInterface,
    context: { operator_id: number; application_id: number },
  ): Promise<AcquisitionInterface>;
}

export abstract class JourneyRepositoryProviderInterfaceResolver implements JourneyRepositoryProviderInterface {
  async create(
    journey: JourneyInterface,
    context: { operator_id: number; application_id: number },
  ): Promise<AcquisitionInterface> {
    throw new Error();
  }
}
