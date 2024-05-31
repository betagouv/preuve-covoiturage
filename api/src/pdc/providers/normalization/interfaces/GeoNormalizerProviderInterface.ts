import { PositionInterface } from './index.ts';

// shared
export interface GeoInterface {
  lat: number;
  lon: number;
  geo_code: string;
}

export interface PartialGeoInterface extends Partial<GeoInterface> {
  literal?: string;
}
// end of shared

export type GeoResultInterface = {
  start: {
    lat: number;
    lon: number;
    geo_code: string;
  };
  end: {
    lat: number;
    lon: number;
    geo_code: string;
  };
};
export interface GeoParamsInterface {
  start: PositionInterface;
  end: PositionInterface;
}

export interface GeoNormalizerProviderInterface {
  handle(params: GeoParamsInterface): Promise<GeoResultInterface>;
}
