const chai = require('chai');
const betweenTime = require('./betweenTime');
const { fakeTrip } = require('../helpers/fake.js');

const { expect } = chai;

describe('incentive: filter time', () => {
  it('works', async () => {
    const tripStakeholder = fakeTrip.people[0];

    // start: new Date(Date.UTC(2018, 1, 10, 8, 0, 0)),
    // end: new Date(Date.UTC(2018, 1, 10, 10, 0, 0)),

    let result;

    result = betweenTime({
      tripStakeholder,
      time: [
        {
          start: '8:0',
          end: '9:30',
        },
        {
          start: '18:0',
          end: '18:30',
        },
      ],
    });

    expect(result).to.equal(true);

    result = betweenTime({
      tripStakeholder,
      time: [
        {
          start: '11:0',
          end: '11:30',
        },
        {
          start: '18:0',
          end: '18:30',
        },
      ],
    });

    expect(result).to.equal(false);
  });
});
