import {
  ParentRepositoryProviderInterface,
  ParentRepositoryProviderInterfaceResolver,
} from '@ilos/provider-repository';

import { Journey } from '../entities/Journey';

export interface JourneyRepositoryProviderInterface extends ParentRepositoryProviderInterface {
  //
  createMany(journeys: Journey[]): Promise<Journey[]>;
}

export abstract class JourneyRepositoryProviderInterfaceResolver extends ParentRepositoryProviderInterfaceResolver {
  //
  async createMany(journeys: Journey[]): Promise<Journey[]> {
    throw new Error();
  }
}
