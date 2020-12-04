import test from 'ava';

import { IdentityVariant } from './IdentityVariant';
import { FakerEngine } from './FakerEngine';

test('should fill identities', (t) => {
  const itentityVariant = new IdentityVariant([5, 4, 4]);
  const trip = FakerEngine.getBasicTrip(5);
  const completedTrip = itentityVariant.generate(trip);

  const identities = completedTrip.map((p) => p.identity_uuid);
  t.log(identities);

  identities.map((i) => t.not(i, 'no one'));
  t.is(new Set([...identities]).size, trip.length);

  const over_18 = completedTrip.map((p) => p.is_over_18);
  t.is(over_18.filter((o) => o).length, 4);

  const travel_pass = completedTrip.map((p) => p.has_travel_pass);
  t.is(travel_pass.filter((o) => o).length, 4);
});
