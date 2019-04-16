const chai = require('chai');
// const _ = require('lodash');
const tripCampaign = require('./tripCampaign');
const { fakeTrip, fakeCampaign } = require('../helpers/fake');

const { expect } = chai;

describe('incentive: processCampaign', () => {
  it('works', async () => {
    const result = tripCampaign({
      campaign: fakeCampaign,
      trip: fakeTrip,
    });

    expect(result.length).to.equal(fakeTrip.people.length * fakeCampaign.policies.length);

    result.forEach((res, i) => {
      expect(res.operator).to.equal(fakeTrip.operator_id);
      expect(res.campaign).to.equal(fakeCampaign._id);
      expect(res.target).to.equal(fakeTrip.people[0]._id);
      expect(res.trip).to.equal(fakeTrip._id);
      expect(res.status).to.equal('pending');
      expect(res.unit).to.equal(fakeCampaign.policies[i].policy.unit);
      switch (i) {
        case 0:
          expect(res.amount).to.equal(1.74);
          break;
        case 1:
          expect(res.amount).to.equal(0.87);
          break;
        default:
      }
    });
  });
});
