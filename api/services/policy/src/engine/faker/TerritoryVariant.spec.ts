import test from 'ava';

import { TerritoryVariant } from './TerritoryVariant';
import { FakerEngine } from './FakerEngine';

test('should fill seats', (t) => {
  let params = {
    start: [1, 2],
    end: [1],
  };
  let territoryVariant = new TerritoryVariant(params);
  let trip = FakerEngine.getBasicTrip(3);
  let completedTrip = territoryVariant.generate(trip);
  let start = completedTrip.map((p) => p.start_territory_id).reduce((arr, i) => [...arr, ...i], []);
  t.log(start);
  start.map((s) => t.true(params.start.indexOf(s) > -1));

  let end = completedTrip.map((p) => p.end_territory_id).reduce((arr, i) => [...arr, ...i], []);
  t.log(end);
  end.map((s) => t.true(params.end.indexOf(s) > -1));
});
