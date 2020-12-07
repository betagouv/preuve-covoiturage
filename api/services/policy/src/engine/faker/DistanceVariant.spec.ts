import test from 'ava';

import { DistanceVariant } from './DistanceVariant';
import { FakerEngine } from './FakerEngine';

test('should fill distance', (t) => {
  const min = 1;
  const max = 100;
  const distanceVariant = new DistanceVariant([min, max]);
  const trip = FakerEngine.getBasicTrip(3);
  const completedTrip = distanceVariant.generate(trip);
  const distances = completedTrip.map((p) => p.distance);

  t.log(distances);
  t.true(distances.reduce((sum, i) => sum + i, 0) <= 1000 * max * completedTrip.length);

  completedTrip.map((p) => t.is(p.cost, p.is_driver ? -p.distance / 100 : p.distance / 100));
});
