export interface PositionInterface {
  datetime: Date;
  country?: string;
  insee?: string;
  lon?: number;
  lat?: number;
  literal?: string;
  postcodes?: string[];
  town?: string;
  territory_id?: number;
}
