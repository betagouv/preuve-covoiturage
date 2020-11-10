import test from 'ava';

import { OperatorClassVariant } from './OperatorClassVariant';
import { FakerEngine } from './FakerEngine';

test('should fill operator class', (t) => {
  const operatorClassVariant = new OperatorClassVariant();
  const trip = FakerEngine.getBasicTrip(3);
  const completedTrip = operatorClassVariant.generate(trip);
  const classes = completedTrip.map((p) => p.operator_class);
  t.log(classes);
  t.pass();
});
