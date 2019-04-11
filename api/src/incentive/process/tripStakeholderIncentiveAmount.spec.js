const chai = require('chai');
// const _ = require('lodash');
const tripStakeholderIncentiveAmount = require('./tripStakeholderIncentiveAmount');
const { fakeTrip, fakeCampaign } = require('../helpers/fake');

const { expect } = chai;

describe('incentive: processPolicy', () => {
  it('works with simple policy and round', async () => {
    const { policy, parameters } = fakeCampaign.policies.find(policyDef => policyDef.policy._id === 'base');
    const tripStakeholder = fakeTrip.people[0];
    const result = tripStakeholderIncentiveAmount({
      policy,
      parameters,
      tripStakeholder,
      trip: fakeTrip,
    });

    expect(result).to.equal(1.74);
  });
  it('works with formula based policy', async () => {
    const { policy, parameters } = fakeCampaign.policies.find(policyDef => policyDef.policy._id === 'complex');
    const tripStakeholder = fakeTrip.people[0];
    const result = tripStakeholderIncentiveAmount({
      policy,
      parameters,
      tripStakeholder,
      trip: fakeTrip,
    });

    expect(result).to.equal(0.87);
  });
});
