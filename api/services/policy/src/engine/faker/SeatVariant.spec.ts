import test from 'ava';

import { SeatVariant } from './SeatVariant';
import { FakerEngine } from './FakerEngine';

test('should fill seats', (t) => {
  const seatVariant = new SeatVariant();
  const trip = FakerEngine.getBasicTrip(3);
  const completedTrip = seatVariant.generate(trip);
  const seats = completedTrip.map((p) => p.seats);
  t.log(seats);
  t.true(seats.reduce((sum, i) => sum + i, 0) <= 9);
});
