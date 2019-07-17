export interface PositionInterface {
  datetime: Date;
  lat?: number;
  lon?: number;
  insee?: string;
  literal?: string;
  country?: string;
  territories?: string[];
}
