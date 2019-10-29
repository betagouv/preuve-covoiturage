export interface PositionInterface {
  datetime: Date;
  lat?: number;
  lon?: number;
  insee?: string;
  postcodes?: string[];
  town?: string;
  country?: string;
  literal?: string;
  territory?: string;
}
