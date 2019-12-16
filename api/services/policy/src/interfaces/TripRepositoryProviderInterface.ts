import { TripInterface } from './TripInterface';

export interface TripRepositoryProviderInterface {
  findByTripId(id: string): Promise<TripInterface>;
}

export abstract class TripRepositoryProviderInterfaceResolver implements TripRepositoryProviderInterface {
  async findByTripId(id: string): Promise<TripInterface> {
    throw new Error();
  }
}
