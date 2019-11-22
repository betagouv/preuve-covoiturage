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
  towns?: string[];

  distance?: {
    min?: number;
    max?: number;
  };

  ranks?: string[];
  operator_id?: number[];
  territory_id?: number[];
  visible_operator_ids?: number[];
  skip: number;
  limit: number;
}
