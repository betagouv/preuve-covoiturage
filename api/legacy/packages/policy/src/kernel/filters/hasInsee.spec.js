const chai = require('chai');
const hasInsee = require('./hasInsee');
const { fakeTrip } = require('../helpers/fake.js.js');

const { expect } = chai;

describe('incentive: filter insee', () => {
  it('works', async () => {
    const tripStakeholder = fakeTrip.people[0];
    //  start.insee: 69001,
    //  end.insee: 69028,
    let result;


    // WHITELIST

    result = hasInsee({
      tripStakeholder,
      insee: {
        whiteList: {
          start: [69001, 69002, 69047],
        },
      },
    });

    expect(result).to.equal(true);

    result = hasInsee({
      tripStakeholder,
      insee: {
        whiteList: {
          start: [69003, 69002, 69047],
        },
      },
    });

    expect(result).to.equal(false);


    result = hasInsee({
      tripStakeholder,
      insee: {
        whiteList: {
          end: [69001, 69028, 69047],
        },
      },
    });

    expect(result).to.equal(true);

    result = hasInsee({
      tripStakeholder,
      insee: {
        whiteList: {
          end: [69001, 69029, 69047],
        },
      },
    });

    expect(result).to.equal(false);

    result = hasInsee({
      tripStakeholder,
      insee: {
        whiteList: {
          end: [69001, 69028, 69047],
        },
      },
    });

    expect(result).to.equal(true);

    result = hasInsee({
      tripStakeholder,
      insee: {
        whiteList: {
          start: [69001, 69028, 69047],
          end: [69001, 69028, 69047],
        },
      },
    });

    expect(result).to.equal(true);

    result = hasInsee({
      tripStakeholder,
      insee: {
        whiteList: {
          start: [69001, 69028, 69047],
          end: [69001, 69029, 69047],
        },
      },
    });

    expect(result).to.equal(false);

    result = hasInsee({
      tripStakeholder,
      insee: {
        whiteList: {
          start: [69002, 69028, 69047],
          end: [69001, 69028, 69047],
        },
      },
    });

    expect(result).to.equal(false);

    // BLACK LIST

    result = hasInsee({
      tripStakeholder,
      insee: {
        blackList: {
          start: [69001, 69002, 69047],
        },
      },
    });

    expect(result).to.equal(false);

    result = hasInsee({
      tripStakeholder,
      insee: {
        blackList: {
          start: [69003, 69002, 69047],
        },
      },
    });

    expect(result).to.equal(true);


    result = hasInsee({
      tripStakeholder,
      insee: {
        blackList: {
          end: [69001, 69028, 69047],
        },
      },
    });

    expect(result).to.equal(false);

    result = hasInsee({
      tripStakeholder,
      insee: {
        blackList: {
          end: [69001, 69029, 69047],
        },
      },
    });

    expect(result).to.equal(true);

    result = hasInsee({
      tripStakeholder,
      insee: {
        blackList: {
          end: [69001, 69028, 69047],
        },
      },
    });

    expect(result).to.equal(false);

    result = hasInsee({
      tripStakeholder,
      insee: {
        blackList: {
          start: [69001, 69028, 69047],
          end: [69001, 69028, 69047],
        },
      },
    });

    expect(result).to.equal(false);

    result = hasInsee({
      tripStakeholder,
      insee: {
        blackList: {
          start: [69002, 69028, 69047],
          end: [69001, 69029, 69047],
        },
      },
    });

    expect(result).to.equal(true);

    result = hasInsee({
      tripStakeholder,
      insee: {
        blackList: {
          start: [69001, 69028, 69047],
          end: [69001, 69029, 69047],
        },
      },
    });

    expect(result).to.equal(false);


    // WHITELIST && BLACKLIST

    result = hasInsee({
      tripStakeholder,
      insee: {
        whiteList: {
          start: [69001, 69028, 69047],
        },
        blackList: {
          end: [69003, 69034, 69049],
        },
      },
    });

    expect(result).to.equal(true);

    result = hasInsee({
      tripStakeholder,
      insee: {
        whiteList: {
          end: [69001, 69028, 69047],
        },
        blackList: {
          start: [69001, 69028, 69047],
        },
      },
    });

    expect(result).to.equal(false);
  });
});
