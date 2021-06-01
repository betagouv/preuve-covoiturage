import { ApiGraphTimeMode } from './ApiGraphTimeMode';

export interface PublicTripSearchInterface {
  tz?: string;
  group_by?: ApiGraphTimeMode;
  date?: {
    start?: Date;
    end?: Date;
  };
}

export interface TripSearchInterface extends PublicTripSearchInterface {
  campaign_id?: number[];
  days?: number[];
  status?: string;
  distance?: {
    min?: number;
    max?: number;
  };
  ranks?: string[];
  operator_id?: number[];
  territory_id?: number[];
}

export interface TripSearchInterfaceWithPagination extends TripSearchInterface {
  skip: number;
  limit: number;
}
