import test from 'ava';

import { OperatorClassVariant } from './OperatorClassVariant';
import { FakerEngine } from './FakerEngine';

test('should fill operator class', (t) => {
  let operatorClassVariant = new OperatorClassVariant();
  let trip = FakerEngine.getBasicTrip(3);
  let completedTrip = operatorClassVariant.generate(trip);
  let classes = completedTrip.map((p) => p.operator_class);
  t.log(classes);
  t.true(new Set([...classes]).size > 1);
});
