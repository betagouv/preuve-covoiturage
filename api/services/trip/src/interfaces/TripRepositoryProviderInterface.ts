import { TripSearchInterfaceWithPagination } from '../shared/trip/common/interfaces/TripSearchInterface';
import { ResultWithPagination } from '../shared/common/interfaces/ResultWithPagination';
import { LightTripInterface } from './LightTripInterface';
import { StatInterface } from './StatInterface';

export interface TripRepositoryInterface {
  stats(params: Partial<TripSearchInterfaceWithPagination>): Promise<StatInterface[]>;
  search(params: Partial<TripSearchInterfaceWithPagination>): Promise<ResultWithPagination<LightTripInterface>>;
  searchWithCursor(params: {
    date: { start: Date; end: Date };
    operator_id?: number[];
    territory_id?: number[];
  }): Promise<(count: number) => Promise<LightTripInterface[]>>;
}
export abstract class TripRepositoryProviderInterfaceResolver implements TripRepositoryInterface {
  public async stats(params: Partial<TripSearchInterfaceWithPagination>): Promise<StatInterface[]> {
    throw new Error();
  }

  public async search(
    params: Partial<TripSearchInterfaceWithPagination>,
  ): Promise<ResultWithPagination<LightTripInterface>> {
    throw new Error();
  }

  public async searchWithCursor(params: {
    date: { start: Date; end: Date };
    operator_id?: number[];
    territory_id?: number[];
  }): Promise<(count: number) => Promise<LightTripInterface[]>> {
    throw new Error();
  }
}
