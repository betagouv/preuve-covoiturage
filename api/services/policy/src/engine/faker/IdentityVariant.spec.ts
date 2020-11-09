import test from 'ava';

import { IdentityVariant } from './IdentityVariant';
import { FakerEngine } from './FakerEngine';

test('should fill identities', (t) => {
  let itentityVariant = new IdentityVariant([5, 4, 4]);
  let trip = FakerEngine.getBasicTrip(5);
  let completedTrip = itentityVariant.generate(trip);

  let identities = completedTrip.map((p) => p.identity_uuid);
  t.log(identities);

  identities.map((i) => t.not(i, 'no one'));
  t.is(new Set([...identities]).size, trip.length);

  let over_18 = completedTrip.map((p) => p.is_over_18);
  t.is(over_18.filter((o) => o).length, 4);

  let travel_pass = completedTrip.map((p) => p.has_travel_pass);
  t.is(travel_pass.filter((o) => o).length, 4);
});
