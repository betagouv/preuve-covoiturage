const chai = require('chai');
const hasRank = require('./hasRank');
const { fakeTrip } = require('../helpers/fake.js.js');

const { expect } = chai;

describe('incentive: filter rank', () => {
  it('works', async () => {
    const tripStakeholder = fakeTrip.people[0];
    //  class: 'A',
    let result;

    result = hasRank({
      tripStakeholder,
      rank: ['A', 'B'],
    });

    expect(result).to.equal(true);

    result = hasRank({
      tripStakeholder,
      rank: ['B'],
    });

    expect(result).to.equal(false);
  });
});
