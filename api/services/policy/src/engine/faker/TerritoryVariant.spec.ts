import test from 'ava';

import { TerritoryVariant } from './TerritoryVariant';
import { FakerEngine } from './FakerEngine';

test('should fill territory', (t) => {
  const params = {
    start: [{ com: '91471', aom: '217500016' }],
    end: [{ com: '91471', aom: '217500016' }],
  };
  const territoryVariant = new TerritoryVariant(params);
  const trip = FakerEngine.getBasicTrip(3);
  const completedTrip = territoryVariant.generate(trip);
  const start = completedTrip.map((p) => p.start.com);
  start.map((com) => t.true(params.start.findIndex((s) => s.com === com) >= 0));
  const end = completedTrip.map((p) => p.end.com);
  end.map((com) => t.true(params.end.findIndex((s) => s.com === com) >= 0));
});
