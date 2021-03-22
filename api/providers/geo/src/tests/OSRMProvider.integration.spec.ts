import test from 'ava';

import { OSRMProvider } from '../providers';
import { routeOsrm } from './data';

const provider = new OSRMProvider();

test('OSRMProvider: positionToInsee', async (t) => {
  const { distance, duration } = await provider.getRouteMeta(routeOsrm.start, routeOsrm.end);
  t.assert(
    distance <= routeOsrm.distance * 1.1 && distance >= routeOsrm.distance * 0.9,
    `distance calculated should be close to ${routeOsrm.distance}`,
  );
  t.assert(
    duration <= routeOsrm.duration * 1.25 && duration >= routeOsrm.duration * 0.75,
    `duration calculated should be close to ${routeOsrm.duration}`,
  );
});
