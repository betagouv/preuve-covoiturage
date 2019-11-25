import { TripSearchInterfaceWithPagination } from '../shared/trip/common/interfaces/TripSearchInterface';
import { ResultWithPagination } from '../shared/common/interfaces/ResultWithPagination';
import { LightTripInterface } from './LightTripInterface';

export interface TripPgRepositoryInterface {
  stats(params: Partial<TripSearchInterfaceWithPagination>): Promise<any>;
  search(params: Partial<TripSearchInterfaceWithPagination>): Promise<ResultWithPagination<LightTripInterface>>;
}
export abstract class TripPgRepositoryProviderInterfaceResolver implements TripPgRepositoryInterface {
  public async stats(params: Partial<TripSearchInterfaceWithPagination>): Promise<any> {
    throw new Error();
  }

  public async search(
    params: Partial<TripSearchInterfaceWithPagination>,
  ): Promise<ResultWithPagination<LightTripInterface>> {
    throw new Error();
  }
}
