import { StatelessContextInterface, StatelessRuleHelper } from '../../interfaces';
import distance from '@turf/distance';
import { point } from '@turf/helpers';

interface IsCloseToParams {
  position: { lat: number; lon: number };
  radius: number;
}

export const isCloseTo: StatelessRuleHelper<IsCloseToParams> = (
  ctx: StatelessContextInterface,
  params: IsCloseToParams,
): boolean => {
  const start = point([ctx.carpool.start_lon, ctx.carpool.start_lat]);
  const end = point([ctx.carpool.end_lon, ctx.carpool.end_lat]);
  const base = point([params.position.lon, params.position.lat]);
  return (
    distance(start, base, { units: 'meters' }) <= params.radius ||
    distance(end, base, { units: 'meters' }) <= params.radius
  );
};
