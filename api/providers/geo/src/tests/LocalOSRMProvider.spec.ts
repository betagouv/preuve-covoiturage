import test from 'ava';

import { LocalOSRMProvider } from '../providers';
import { roughly } from './helpers/roughly';
import { route } from './data';

const provider = new LocalOSRMProvider();

test('LocalOSRMProvider: positionToInsee', async (t) => {
  const { distance, duration } = await provider.getRouteMeta(route.start, route.end);
  t.true(roughly(distance, route.distance));
  t.true(roughly(duration, route.duration));
});
