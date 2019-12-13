export interface TripSearchInterface {
  campaign_id?: number[];
  date?: {
    start?: Date;
    end?: Date;
  };
  hour?: {
    start: number;
    end: number;
  };
  days?: number[];

  status?: string;
  insee?: string[];

  distance?: {
    min?: number;
    max?: number;
  };

  ranks?: string[];
  operator_id?: number[];
  territory_id?: number[];
  operator_territory_id: number;
}

export interface TripSearchInterfaceWithPagination extends TripSearchInterface {
  skip: number;
  limit: number;
}
