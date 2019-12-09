import { AcquisitionInterface } from '../shared/acquisition/common/interfaces/AcquisitionInterface';
import { JourneyInterface } from '../shared/common/interfaces/JourneyInterface';

export interface JourneyRepositoryProviderInterface {
  create(
    journey: JourneyInterface,
    context: { operator_id: number; application_id: string },
  ): Promise<AcquisitionInterface>;
  createMany(
    journeys: JourneyInterface[],
    context: { operator_id: number; application_id: string },
  ): Promise<AcquisitionInterface[]>;
}

export abstract class JourneyRepositoryProviderInterfaceResolver implements JourneyRepositoryProviderInterface {
  async create(
    journey: JourneyInterface,
    context: { operator_id: number; application_id: string },
  ): Promise<AcquisitionInterface> {
    throw new Error();
  }
  async createMany(
    journeys: JourneyInterface[],
    context: { operator_id: number; application_id: string },
  ): Promise<AcquisitionInterface[]> {
    throw new Error();
  }
}
