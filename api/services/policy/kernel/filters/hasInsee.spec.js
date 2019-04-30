const chai = require('chai');
const hasInsee = require('./hasInsee');
const { fakeTrip } = require('../helpers/fake.js');

const { expect } = chai;

describe('incentive: filter insee', () => {
  it('works', async () => {
    const tripStakeholder = fakeTrip.people[0];
    //  start.insee: 69001,
    //  end.insee: 69028,
    let result;


    /*
     * OR
     */

    // WHITELIST

    result = hasInsee({
      tripStakeholder,
      insee: {
        whiteList: {
          or: {
            start: [69001, 69002, 69047],

          },
        },
      },
    });

    expect(result).to.equal(true);

    result = hasInsee({
      tripStakeholder,
      insee: {
        whiteList: {
          or: {
            start: [69003, 69002, 69047],

          },
        },
      },
    });

    expect(result).to.equal(false);


    result = hasInsee({
      tripStakeholder,
      insee: {
        whiteList: {
          or: {
            end: [69001, 69028, 69047],
          },
        },
      },
    });

    expect(result).to.equal(true);

    result = hasInsee({
      tripStakeholder,
      insee: {
        whiteList: {
          or: {
            end: [69001, 69029, 69047],
          },
        },
      },
    });

    expect(result).to.equal(false);

    result = hasInsee({
      tripStakeholder,
      insee: {
        whiteList: {
          or: {
            end: [69001, 69028, 69047],
          },
        },
      },
    });

    expect(result).to.equal(true);

    result = hasInsee({
      tripStakeholder,
      insee: {
        whiteList: {
          or: {
            start: [69001, 69028, 69047],
            end: [69001, 69028, 69047],
          },

        },
      },
    });

    expect(result).to.equal(true);

    result = hasInsee({
      tripStakeholder,
      insee: {
        whiteList: {
          or: {
            start: [69001, 69028, 69047],
            end: [69001, 69029, 69047],
          },

        },
      },
    });

    expect(result).to.equal(true);

    result = hasInsee({
      tripStakeholder,
      insee: {
        whiteList: {
          or: {
            start: [69002, 69028, 69047],
            end: [69001, 69028, 69047],
          },
        },
      },
    });

    expect(result).to.equal(true);

    // BLACK LIST

    result = hasInsee({
      tripStakeholder,
      insee: {
        blackList: {
          or: {
            start: [69001, 69002, 69047],

          },
        },
      },
    });

    expect(result).to.equal(false);

    result = hasInsee({
      tripStakeholder,
      insee: {
        blackList: {
          or: {
            start: [69003, 69002, 69047],

          },
        },
      },
    });

    expect(result).to.equal(true);


    result = hasInsee({
      tripStakeholder,
      insee: {
        blackList: {
          or: {
            end: [69001, 69028, 69047],

          },
        },
      },
    });

    expect(result).to.equal(false);

    result = hasInsee({
      tripStakeholder,
      insee: {
        blackList: {
          or: {
            end: [69001, 69029, 69047],

          },
        },
      },
    });

    expect(result).to.equal(true);

    result = hasInsee({
      tripStakeholder,
      insee: {
        blackList: {
          or: {
            end: [69001, 69028, 69047],

          },
        },
      },
    });

    expect(result).to.equal(false);

    result = hasInsee({
      tripStakeholder,
      insee: {
        blackList: {
          or: {
            start: [69001, 69028, 69047],
            end: [69001, 69028, 69047],
          },

        },
      },
    });

    expect(result).to.equal(false);

    result = hasInsee({
      tripStakeholder,
      insee: {
        blackList: {
          or: {
            start: [69002, 69028, 69047],
            end: [69001, 69029, 69047],

          },
        },
      },
    });

    expect(result).to.equal(true);

    result = hasInsee({
      tripStakeholder,
      insee: {
        blackList: {
          or: {
            start: [69001, 69028, 69047],
            end: [69001, 69029, 69047],
          },

        },
      },
    });

    expect(result).to.equal(false);


    // WHITELIST && BLACKLIST

    result = hasInsee({
      tripStakeholder,
      insee: {
        whiteList: {
          or: {
            start: [69001, 69028, 69047],
          },
        },
        blackList: {
          or: {
            end: [69003, 69034, 69049],
          },
        },
      },
    });

    expect(result).to.equal(true);

    result = hasInsee({
      tripStakeholder,
      insee: {
        whiteList: {
          or: {
            end: [69001, 69028, 69047],
          },
        },
        blackList: {
          or: {
            start: [69001, 69028, 69047],
          },
        },
      },
    });

    expect(result).to.equal(false);


    /*
     * AND
     */

    // WHITELIST

    result = hasInsee({
      tripStakeholder,
      insee: {
        whiteList: {
          and: {
            start: [69001, 69002, 69047],
            end: [69001, 69002, 69028],
          },
        },
      },
    });

    expect(result).to.equal(true);

    result = hasInsee({
      tripStakeholder,
      insee: {
        whiteList: {
          and: {
            start: [69002],
            end: [69028],
          },
        },
      },
    });

    expect(result).to.equal(false);


    // BLACKLIST

    result = hasInsee({
      tripStakeholder,
      insee: {
        blackList: {
          and: {
            start: [69001, 69002, 69047],
            end: [69001, 69002, 69028],
          },
        },
      },
    });

    expect(result).to.equal(false);

    result = hasInsee({
      tripStakeholder,
      insee: {
        blackList: {
          and: {
            start: [69003, 69002, 69047],
            end: [69001, 69002, 69028],
          },
        },
      },
    });

    expect(result).to.equal(true);
  });
});
