import test from 'ava';

import { LocalOSRMProvider } from '../providers';
import { route } from './data';

const provider = new LocalOSRMProvider();

test('LocalOSRMProvider: positionToInsee', async (t) => {
  const { distance, duration } = await provider.getRouteMeta(route.start, route.end);
  t.is(distance, route.distance);
  t.is(duration, route.duration);
});
