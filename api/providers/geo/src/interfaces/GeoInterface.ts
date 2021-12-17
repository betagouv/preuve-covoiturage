export interface GeoInterface {
  lat: number;
  lon: number;
  geo_code: string;
}

export interface PartialGeoInterface extends Partial<GeoInterface> {
  literal?: string;
}
