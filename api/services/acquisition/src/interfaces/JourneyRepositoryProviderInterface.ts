import {
  ParentRepositoryInterface,
  ParentRepositoryInterfaceResolver,
} from '@ilos/repository';

import { Journey } from '../entities/Journey';

export interface JourneyRepositoryProviderInterface extends ParentRepositoryInterface {
  createMany(journeys: Journey[]): Promise<Journey[]>;
}

export abstract class JourneyRepositoryProviderInterfaceResolver extends ParentRepositoryInterfaceResolver {
  async createMany(journeys: Journey[]): Promise<Journey[]> {
    throw new Error();
  }
}
