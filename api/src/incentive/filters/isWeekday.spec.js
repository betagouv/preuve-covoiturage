const chai = require('chai');
const isWeekday = require('./isWeekday');
const { fakeTrip } = require('../helpers/fake.js');

const { expect } = chai;

describe('incentive: filter weekday', () => {
  it('works', async () => {
    const tripStakeholder = fakeTrip.people[0];

    let result;
    // fake = 2

    result = isWeekday({
      tripStakeholder,
      weekday: [0, 2, 6, 7],
    });

    expect(result).to.equal(true);

    result = isWeekday({
      tripStakeholder,
      weekday: [0, 1],
    });

    expect(result).to.equal(false);
  });
});
