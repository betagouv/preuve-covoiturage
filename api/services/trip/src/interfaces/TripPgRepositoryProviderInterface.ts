import { JourneyInterface } from '../shared/common/interfaces/JourneyInterface';
import { TripSearchInterface } from '../shared/trip/common/interfaces/TripSearchInterface';
import { ResultWithPagination } from '../shared/common/interfaces/ResultWithPagination';
import { LightTripInterface } from './LightTripInterface';

export interface TripPgRepositoryInterface {
  findOrCreateTripForJourney(journey: JourneyInterface): Promise<[boolean, { _id: string }]>;
  stats(params: TripSearchInterface): Promise<any>;
  search(params: TripSearchInterface): Promise<ResultWithPagination<LightTripInterface>>;
}
export abstract class TripPgRepositoryProviderInterfaceResolver implements TripPgRepositoryInterface {
  public async findOrCreateTripForJourney(journey: JourneyInterface): Promise<[boolean, { _id: string }]> {
    throw new Error();
  }

  public async stats(params: TripSearchInterface): Promise<any> {
    throw new Error();
  }

  public async search(params: TripSearchInterface): Promise<ResultWithPagination<LightTripInterface>> {
    throw new Error();
  }
}
