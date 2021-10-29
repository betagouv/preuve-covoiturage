import { TripSearchInterface } from '../shared/trip/common/interfaces/TripSearchInterface';
import { TerritoryTripsInterface } from './TerritoryTripsInterface';

export interface OpenDataContextMetadata {
  queryParam: TripSearchInterface;
  excludedTerritories: TerritoryTripsInterface[];
}
