import { OpenDataTripSearchInterface } from '../shared/trip/common/interfaces/TripSearchInterface';
import { TerritoryTripsInterface } from './TerritoryTripsInterface';

export interface OpenDataContextMetadata {
  queryParam: OpenDataTripSearchInterface;
  excludedTerritories: TerritoryTripsInterface[];
}
