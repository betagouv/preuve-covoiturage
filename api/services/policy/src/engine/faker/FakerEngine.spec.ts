import test from 'ava';

import { FakerEngine } from './FakerEngine';
import { CampaignInterface } from '../../shared/policy/common/interfaces/CampaignInterface';

test('should work', (t) => {
  const start_date = new Date();
  start_date.setHours(0, 0, 0, 0);
  const end_date = new Date();
  end_date.setDate(start_date.getDate() + 7);
  end_date.setHours(23, 59, 59, 999);

  const campaign: CampaignInterface = {
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
  const fakerEngine = FakerEngine.fromPolicy(campaign);
  const trips = fakerEngine.generate(10);
  console.table(trips.reduce((arr, i) => [...arr, ...i], []));
  t.pass();
});
