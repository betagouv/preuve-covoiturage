import test from 'ava';

import { OSRMProvider } from '../providers';
import { routeOsrm } from './data';

const provider = new OSRMProvider();

test('OSRMProvider: positionToInsee', async (t) => {
  const { distance, duration } = await provider.getRouteMeta(routeOsrm.start, routeOsrm.end);
  t.is(distance, routeOsrm.distance);
  t.is(duration, routeOsrm.duration);
});
