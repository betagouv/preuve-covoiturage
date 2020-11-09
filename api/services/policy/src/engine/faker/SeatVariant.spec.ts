import test from 'ava';

import { SeatVariant } from './SeatVariant';
import { FakerEngine } from './FakerEngine';

test('should fill seats', (t) => {
  let seatVariant = new SeatVariant();
  let trip = FakerEngine.getBasicTrip(3);
  let completedTrip = seatVariant.generate(trip);
  let seats = completedTrip.map((p) => p.seats);
  t.log(seats);
  t.true(seats.reduce((sum, i) => sum + i, 0) <= 9);
});
