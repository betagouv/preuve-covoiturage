const chai = require('chai');
const inRange = require('./inRange');
const { fakeTrip } = require('../helpers/fake.js');

const { expect } = chai;

describe('incentive: filter range', () => {
  it('works', async () => {
    const tripStakeholder = fakeTrip.people[0];
    // distance: 17.35,
    let result;

    result = inRange({
      tripStakeholder,
      range: {
        min: 0,
        max: 20,
      },
    });

    expect(result).to.equal(true);

    result = inRange({
      tripStakeholder,
      range: {
        min: 20,
        max: 40,
      },
    });

    expect(result).to.equal(false);

    result = inRange({
      tripStakeholder,
      range: {
        min: 0,
        max: 10,
      },
    });

    expect(result).to.equal(false);
  });
});
