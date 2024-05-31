import { ApiGraphTimeMode } from './ApiGraphTimeMode.ts';
import { TripSearchInterface } from './TripSearchInterface.ts';

export interface TripStatInterface extends TripSearchInterface {
  group_by?: ApiGraphTimeMode;
}
