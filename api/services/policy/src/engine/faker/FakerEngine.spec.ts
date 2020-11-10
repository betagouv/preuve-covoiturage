import test from 'ava';

import { FakerEngine } from './FakerEngine';
import { CampaignInterface } from '../../shared/policy/common/interfaces/CampaignInterface';

test('should fill seats', (t) => {
  let start_date = new Date();
  start_date.setHours(0, 0, 0, 0);
  let end_date = new Date();
  end_date.setDate(start_date.getDate() + 7);
  end_date.setHours(23, 59, 59, 999);

  let campaign: CampaignInterface = {
    start_date,
    end_date,
    territory_id: 1,
    name: 'Campaign',
    description: 'My campaign',
    unit: 'euro',
    status: 'draft',
    global_rules: [],
    rules: [],
  };
  let fakerEngine = FakerEngine.fromPolicy(campaign);
  let trips = fakerEngine.generate(10);
  console.table(trips.reduce((arr, i) => [...arr, ...i], []));
});
