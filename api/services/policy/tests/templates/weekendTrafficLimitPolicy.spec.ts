import { expect } from 'chai';

import { TripInterface, CampaignInterface } from '../../src/interfaces';
import { PolicyEngine } from '../../src/engine/PolicyEngine';
import { helper } from './helper';
import { weekendTrafficLimitPolicy } from '../../src/engine/template';
import { trips as fakeTrips } from './trips';

describe('Template: weekendTrafficLimitPolicy', () => {
  const template: CampaignInterface = {
    ...weekendTrafficLimitPolicy,
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
    expect(results).to.deep.members([{ policy_id, acquisition_id: 8, identity_uuid: '6', amount: 150 }]);
  });
});
