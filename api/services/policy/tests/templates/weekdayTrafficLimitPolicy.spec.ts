import { expect } from 'chai';

import { TripInterface, CampaignInterface } from '../../src/interfaces';
import { PolicyEngine } from '../../src/engine/PolicyEngine';
import { helper } from './helper';
import { weekdayTrafficLimitPolicy } from '../../src/engine/template';
import { trips as fakeTrips } from './trips';

describe('Template: weekdayTrafficLimitPolicy', () => {
  const template: CampaignInterface = {
    ...weekdayTrafficLimitPolicy,
    territory_id: 1,
    status: 'active',
    start_date: new Date('2019-01-01'),
    end_date: new Date('2019-02-01'),
  };

  const trips: TripInterface[] = [...fakeTrips];

  const { up, down } = helper();
  let engine: PolicyEngine;
  let policy_id: number;

  before(async () => {
    ({ engine, policy_id } = await up(template));
  });

  after(async () => {
    await down();
  });

  it('should work', async () => {
    const results = [];
    for (const trip of trips) {
      const r = await engine.process(trip);
      results.push(...r);
    }
    expect(results).to.deep.members([
      { policy_id, acquisition_id: 4, identity_uuid: '4', amount: 300 },
      { policy_id, acquisition_id: 4, identity_uuid: '5', amount: 75 },
      { policy_id, acquisition_id: 5, identity_uuid: '4', amount: 1000 },
      { policy_id, acquisition_id: 5, identity_uuid: '5', amount: 500 },
      { policy_id, acquisition_id: 7, identity_uuid: '4', amount: 150 },
      { policy_id, acquisition_id: 7, identity_uuid: '5', amount: 75 },
    ]);
  });
});
