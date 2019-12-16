import { TripInterface } from './TripInterface';

export interface TripRepositoryProviderInterface {
  getByTripId(id: number): Promise<TripInterface>;
}

export abstract class TripRepositoryProviderInterfaceResolver implements TripRepositoryProviderInterface {
  async getByTripId(id: number): Promise<TripInterface> {
    throw new Error();
  }
}
