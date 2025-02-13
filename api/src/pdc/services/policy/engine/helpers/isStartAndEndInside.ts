import {
  booleanPointInPolygon,
  Feature,
  MultiPolygon,
  multiPolygon,
  point,
  Polygon,
  polygon,
  Properties,
} from "@/deps.ts";
import type { GeoJSON } from "@/pdc/services/geo/contracts/GeoJson.ts";
import { NotEligibleTargetException } from "@/pdc/services/policy/engine/exceptions/NotEligibleTargetException.ts";
import { StatelessContextInterface, StatelessRuleHelper } from "../../interfaces/index.ts";

export const isStartAndEndInside: StatelessRuleHelper<GeoJSON> = (
  ctx: StatelessContextInterface,
  params: GeoJSON,
): boolean => {
  const start = point([ctx.carpool.start_lon, ctx.carpool.start_lat]);
  const end = point([ctx.carpool.end_lon, ctx.carpool.end_lat]);
  const shape = getShapeFromGeoJSON(params);

  return booleanPointInPolygon(start, shape) &&
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

export const isStartAndEndInsideOrThrow = (ctx: StatelessContextInterface, params: GeoJSON) => {
  if (isStartAndEndInside(ctx, params)) {
    throw new NotEligibleTargetException(
      `Trip should not be in a common transport area: ${ctx?.carpool?.start}, ${ctx?.carpool?.end}`,
    );
  }
  return true;
};
