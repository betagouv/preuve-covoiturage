import { RepositoryInterface, RepositoryInterfaceResolver } from '@ilos/common';

import { Journey } from '../entities/Journey';

export interface JourneyRepositoryProviderInterface extends RepositoryInterface {
  createMany(journeys: Journey[]): Promise<Journey[]>;
}

export abstract class JourneyRepositoryProviderInterfaceResolver extends RepositoryInterfaceResolver {
  async createMany(journeys: Journey[]): Promise<Journey[]> {
    throw new Error();
  }
}
