import { describe } from 'mocha';
import { expect } from 'chai';
import { StartEndLongitudeCollisionCheck as Check } from '../../src/engine/checks/StartEndLongitudeCollisionCheck';

import { faker } from './faker';

describe(`Check: ${Check.key}`, async () => {
  beforeEach(async () => {
    await faker.up();
  });

  afterEach(async () => {
    await faker.down();
  });

  it('works with max', async () => {
    const check = faker.get(Check);
    const fakeData = await faker.setData(check, {
      start_position: {
        lat: 48.851047,
        lon: 2.309339,
      },
      end_position: {
        lat: 48.851047,
        lon: 2.309339,
      },
    });
    await faker.setData(check, {
      acquisition_id: fakeData.acquisition_id,
      is_driver: true,
      start_position: {
        lat: 48.851047,
        lon: 2.309339,
      },
      end_position: {
        lat: 48.851047,
        lon: 2.309339,
      },
    });

    const res = await check.handle(fakeData.acquisition_id);

    expect(res).to.have.all.keys(['meta', 'karma']);
    expect(res.karma).to.be.eq(100);
  });

  it('works with min', async () => {
    const check = faker.get(Check);
    const fakeData = await faker.setData(check, {
      start_position: {
        lat: 48.851047,
        lon: 3.309339,
      },
      end_position: {
        lat: 48.851047,
        lon: 2.309339,
      },
    });

    await faker.setData(check, {
      acquisition_id: fakeData.acquisition_id,
      is_driver: true,
      start_position: {
        lat: 48.851047,
        lon: 3.309339,
      },
      end_position: {
        lat: 48.851047,
        lon: 2.309339,
      },
    });

    const res = await check.handle(fakeData.acquisition_id);

    expect(res).to.have.all.keys(['meta', 'karma']);
    expect(res.karma).to.be.eq(0);
  });

  it('works between', async () => {
    const check = faker.get(Check);
    const fakeData = await faker.setData(check, {
      start_position: {
        lat: 48.851047,
        lon: 2.309839,
      },
      end_position: {
        lat: 48.851047,
        lon: 2.309339,
      },
    });

    await faker.setData(check, {
      acquisition_id: fakeData.acquisition_id,
      is_driver: true,
      start_position: {
        lat: 48.851047,
        lon: 2.309839,
      },
      end_position: {
        lat: 48.851047,
        lon: 2.309339,
      },
    });

    const res = await check.handle(fakeData.acquisition_id);

    expect(res).to.have.all.keys(['meta', 'karma']);
    expect(res.karma).to.be.gt(0);
    expect(res.karma).to.be.lt(100);
  });
});