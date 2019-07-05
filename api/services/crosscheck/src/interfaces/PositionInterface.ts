export interface PositionInterface {
  datetime: Date;
  country?: string;
  insee?: string;
  lat?: number;
  lon?: number;
  literal?: string;
  postcodes?: string[];
  territory?: string[];
  town?: string;
}
