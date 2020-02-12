import { TripInterface } from './TripInterface';

export interface TripRepositoryProviderInterface {
  findTripsById(ids: string[]): Promise<TripInterface[]>;
}

export abstract class TripRepositoryProviderInterfaceResolver implements TripRepositoryProviderInterface {
  async findTripsById(ids: string[]): Promise<TripInterface[]> {
    throw new Error();
  }
}
