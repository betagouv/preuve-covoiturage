import { StatelessContextInterface, StatelessRuleHelper } from '../../interfaces';
import type { GeoJSON } from 'geojson';
import { Feature, MultiPolygon, Polygon, Properties, multiPolygon, point, polygon } from '@turf/helpers';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

interface IsCloseToParams {
  shape: GeoJSON,
}

export const isInside: StatelessRuleHelper<IsCloseToParams> = (
  ctx: StatelessContextInterface,
  params: IsCloseToParams,
): boolean => {
    const start = point([ctx.carpool.start_lon, ctx.carpool.start_lat]);
    const end = point([ctx.carpool.end_lon, ctx.carpool.end_lat]);
    const shape = getShapeFromGeoJSON(params.shape);
    
    return booleanPointInPolygon(start, shape) || booleanPointInPolygon(end, shape);
};

function getShapeFromGeoJSON(data: GeoJSON): Feature<Polygon|MultiPolygon, Properties> {
    if (data.type === 'Polygon') {
      return polygon(data.coordinates);
    }

    if (data.type === 'MultiPolygon') {
      return multiPolygon(data.coordinates);
    }
    throw new Error('Invalid GeoJSON');
}
