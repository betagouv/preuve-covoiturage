export interface TripSearchInterface {
  campaign_id?: string[];
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
  towns?: string[];

  distance?: {
    min?: number;
    max?: number;
  };

  ranks?: string[];
  operator_id?: string[];
  territory_id?: string[];

  skip: number;
  limit: number;
}
