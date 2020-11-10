import test from 'ava';

import { TerritoryVariant } from './TerritoryVariant';
import { FakerEngine } from './FakerEngine';

test('should fill seats', (t) => {
  const params = {
    start: [1, 2],
    end: [1],
  };
  const territoryVariant = new TerritoryVariant(params);
  const trip = FakerEngine.getBasicTrip(3);
  const completedTrip = territoryVariant.generate(trip);
  const start = completedTrip.map((p) => p.start_territory_id).reduce((arr, i) => [...arr, ...i], []);
  t.log(start);
  start.map((s) => t.true(params.start.indexOf(s) > -1));

  const end = completedTrip.map((p) => p.end_territory_id).reduce((arr, i) => [...arr, ...i], []);
  t.log(end);
  end.map((s) => t.true(params.end.indexOf(s) > -1));
});
