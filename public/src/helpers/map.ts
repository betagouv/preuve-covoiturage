import type { MapGeoJSONFeature } from 'maplibre-gl';
import bbox from '@turf/bbox';

export function getBbox(data: MapGeoJSONFeature) {
  const bounds = bbox(data);
  const coords: [number, number, number, number] = [bounds[0], bounds[1], bounds[2], bounds[3]];
  return coords;
}
