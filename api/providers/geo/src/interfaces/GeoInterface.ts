export interface GeoInterface {
  lat: number;
  lon: number;
  insee: string;
}

export interface PartialGeoInterface extends Partial<GeoInterface> {
  literal?: string;
}
