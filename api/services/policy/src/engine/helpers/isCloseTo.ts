import { StatelessContextInterface, StatelessRuleHelper } from '../../interfaces';

interface IsCloseToParams {
  position: { lat: number; lon: number };
  radius: number;
}

export const isCloseTo: StatelessRuleHelper<IsCloseToParams> = (
  ctx: StatelessContextInterface,
  params: IsCloseToParams,
): boolean => {
  return (
    isWithinRadius(params.position, params.radius, {
      lat: ctx.carpool.start_lat,
      lon: ctx.carpool.start_lon,
    }) ||
    isWithinRadius(params.position, params.radius, {
      lat: ctx.carpool.end_lat,
      lon: ctx.carpool.end_lon,
    })
  );
};

function isWithinRadius(
  ref_position: { lat: number; lon: number },
  radius: number,
  test_position: { lat: number; lon: number },
): boolean {
  const distance = haversineDistance(ref_position, test_position);
  return distance <= radius;
}

export function haversineDistance(
  position1: { lat: number; lon: number },
  position2: { lat: number; lon: number },
): number {
  const earthRadius = 6371e3; // Radius of the Earth in meters

  const lat1 = degreesToRadians(position1.lat);
  const lat2 = degreesToRadians(position2.lat);
  const deltaLat = degreesToRadians(position2.lat - position1.lat);
  const deltaLon = degreesToRadians(position2.lon - position1.lon);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c; // Distance in meters
}

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
