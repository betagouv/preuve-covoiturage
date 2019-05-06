const chai = require('chai');
const hasInsee = require('./hasInsee');
const { fakeTrip } = require('../helpers/fake.js');

const { expect } = chai;

describe('incentive: filter insee', () => {
  const tripStakeholder = fakeTrip.people[0];
  //  start.insee: 69001,
  //  end.insee: 69028,


  it('OR - whitelist - start insee true', async () => {
    const result = hasInsee({
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
  });


  it('OR - whitelist - start insee false', async () => {
    const result = hasInsee({
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
  });


  it('OR - whitelist - end insee true', async () => {
    const result = hasInsee({
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
  });


  it('OR - whitelist - end insee false', async () => {
    const result = hasInsee({
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
  });


  it('OR - whitelist - start & end insee true', async () => {
    const result = hasInsee({
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
  });


  it('OR - whitelist - start insee true - end insee false', async () => {
    const result = hasInsee({
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
  });


  it('OR - whitelist - start insee false - end insee true', async () => {
    const result = hasInsee({
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
  });


  it('OR - blackList - start insee true', async () => {
    const result = hasInsee({
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
  });


  it('OR - blackList - start insee false', async () => {
    const result = hasInsee({
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
  });


  it('OR - blackList - end insee true', async () => {
    const result = hasInsee({
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
  });


  it('OR - blackList - end insee false', async () => {
    const result = hasInsee({
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
  });


  it('OR - blackList - start insee true - end insee true', async () => {
    const result = hasInsee({
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
  });

  it('OR - blackList - start insee false - end insee false ', async () => {
    const result = hasInsee({
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
  });

  it('OR - blackList - start insee true - start insee false', async () => {
    const result = hasInsee({
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
  });

  it('OR - whiteList - start insee true - blackList - end insee false', async () => {
    const result = hasInsee({
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
  });

  it('OR - whiteList - end insee true - blackList - start insee true', async () => {
    const result = hasInsee({
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
  });

  it('AND - whiteList - start insee true - end insee true', async () => {
    const result = hasInsee({
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
  });

  it('AND - whiteList - start insee false - end insee true', async () => {
    const result = hasInsee({
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
  });


  it('AND - whiteList - start insee false - end insee true', async () => {
    const result = hasInsee({
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
  });

  it('AND - blackList - start insee true - end insee true', async () => {
    const result = hasInsee({
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
  });

  it('AND - blackList - start insee false - end insee true', async () => {
    const result = hasInsee({
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
