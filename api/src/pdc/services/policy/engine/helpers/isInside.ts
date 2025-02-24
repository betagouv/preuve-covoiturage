import type { GeoJSON } from "@/pdc/services/geo/contracts/GeoJson.ts";
import { booleanPointInPolygon } from "dep:turf-boolean-point-in-polygon";
import type { Feature, MultiPolygon, Polygon, Properties } from "dep:turf-helpers";
import { multiPolygon, point, polygon } from "dep:turf-helpers";
import { StatelessContextInterface, StatelessRuleHelper } from "../../interfaces/index.ts";

interface IsCloseToParams {
  shape: GeoJSON;
}

export const isInside: StatelessRuleHelper<IsCloseToParams> = (
  ctx: StatelessContextInterface,
  params: IsCloseToParams,
): boolean => {
  const start = point([ctx.carpool.start_lon, ctx.carpool.start_lat]);
  const end = point([ctx.carpool.end_lon, ctx.carpool.end_lat]);
  const shape = getShapeFromGeoJSON(params.shape);

  return booleanPointInPolygon(start, shape) ||
    booleanPointInPolygon(end, shape);
};

function getShapeFromGeoJSON(
  data: GeoJSON,
): Feature<Polygon | MultiPolygon, Properties> {
  if (data.type === "Polygon") {
    return polygon(data.coordinates);
  }

  if (data.type === "MultiPolygon") {
    return multiPolygon(data.coordinates);
  }
  throw new Error("Invalid GeoJSON");
}
