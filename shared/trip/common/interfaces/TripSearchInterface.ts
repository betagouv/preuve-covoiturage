import { TerritorySelectorsInterface } from '../../../territory/common/interfaces/TerritoryCodeInterface';

export interface TripSearchInterface {
  campaign_id?: number[];
  tz?: string;
  date?: {
    start?: Date;
    end?: Date;
  };
  days?: number[];
  status?: string;
  distance?: {
    min?: number;
    max?: number;
  };
  ranks?: string[];
  operator_id?: number[];
  geo_selector?: TerritorySelectorsInterface;
  excluded_start_geo_code?: string[];
  excluded_end_geo_code?: string[];
}

export interface TripSearchInterfaceWithPagination extends TripSearchInterface {
  skip: number;
  limit: number;
}
