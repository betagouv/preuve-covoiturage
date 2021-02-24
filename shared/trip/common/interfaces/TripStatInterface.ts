import { TripSearchInterface } from './TripSearchInterface';

export interface TripStatInterface extends TripSearchInterface {
  group_by: 'day' | 'month';
}
