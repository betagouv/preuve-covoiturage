import test from 'ava';

import { TerritoryVariant } from './TerritoryVariant';
import { FakerEngine } from './FakerEngine';

test('should fill territory', (t) => {
  const params = {
    start: [{ com: ['91377'] }],
    end: [{ com: ['91377'] }],
  };
  const territoryVariant = new TerritoryVariant(params);
  const trip = FakerEngine.getBasicTrip(3);
  const completedTrip = territoryVariant.generate(trip);
  const start = completedTrip.map((p) => p.start).reduce((arr, i) => [...arr, ...i.com], []);
  t.log(start);
  start.map((s) => t.true(params.start.indexOf(s) > -1));

  const end = completedTrip.map((p) => p.end).reduce((arr, i) => [...arr, ...i.com], []);
  t.log(end);
  end.map((s) => t.true(params.end.indexOf(s) > -1));
});
