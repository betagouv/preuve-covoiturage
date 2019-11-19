import { describe } from 'mocha';
import { expect } from 'chai';
import { StartLatitudeCollisionCheck as Check } from '../../src/engine/checks/StartLatitudeCollisionCheck';

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
    const fakeData = await faker.setData(check);
    await faker.setData(check, {
      acquisition_id: fakeData.acquisition_id,
      is_driver: true,
      start_position: {
        lat: fakeData.start_position.lat + 1,
        lon: fakeData.start_position.lon,
      }
    });

    const res = await check.handle(fakeData.acquisition_id);

    expect(res).to.have.all.keys(['meta', 'karma']);
    expect(res.karma).to.be.eq(100);
  });

  it('works with min', async () => {
    const check = faker.get(Check);
    const fakeData = await faker.setData(check);

    await faker.setData(check, {
      acquisition_id: fakeData.acquisition_id,
      is_driver: true,
      start_position: {
        lat: fakeData.start_position.lat,
        lon: fakeData.start_position.lon,
      }
    });

    const res = await check.handle(fakeData.acquisition_id);

    expect(res).to.have.all.keys(['meta', 'karma']);
    expect(res.karma).to.be.eq(0);
  });

  it('works between', async () => {
    const check = faker.get(Check);
    const fakeData = await faker.setData(check);

    await faker.setData(check, {
      acquisition_id: fakeData.acquisition_id,
      is_driver: true,
      start_position: {
        lat: fakeData.start_position.lat + 0.5,
        lon: fakeData.start_position.lon,
      }
    });

    const res = await check.handle(fakeData.acquisition_id);

    expect(res).to.have.all.keys(['meta', 'karma']);
    expect(res.karma).to.be.gt(0);
    expect(res.karma).to.be.lt(100);
  });
});