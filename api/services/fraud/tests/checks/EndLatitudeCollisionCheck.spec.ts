import { describe } from 'mocha';
import { expect } from 'chai';
import { EndLatitudeCollisionCheck as Check } from '../../src/engine/checks/EndLatitudeCollisionCheck';

import { faker } from './faker';

describe(`Check: ${Check.key}`, async () => {
  before(async () => {
    await faker.up();
  });

  beforeEach(async () => {
    await faker.clean();
  });

  after(async () => {
    await faker.down();
  });

  it('works with max', async () => {
    const check = faker.get(Check);
    const delta = 1;
    const fakeData = await faker.setData(check);
    await faker.setData(check, {
      acquisition_id: fakeData.acquisition_id,
      is_driver: true,
      end_position: {
        lat: fakeData.end_position.lat + delta,
        lon: fakeData.end_position.lon,
      },
    });

    const res = await check.handle(fakeData.acquisition_id);

    expect(res).to.have.all.keys(['meta', 'karma']);
    expect(res.karma).to.be.eq(100);
    expect(res.meta).to.deep.eq({ delta });
  });

  it('works with min', async () => {
    const check = faker.get(Check);
    const fakeData = await faker.setData(check);

    await faker.setData(check, {
      acquisition_id: fakeData.acquisition_id,
      is_driver: true,
      end_position: {
        lat: fakeData.end_position.lat,
        lon: fakeData.end_position.lon,
      },
    });

    const res = await check.handle(fakeData.acquisition_id);

    expect(res).to.have.all.keys(['meta', 'karma']);
    expect(res.karma).to.be.eq(0);
    expect(res.meta).to.deep.eq({ delta: 0 });
  });

  it('works between', async () => {
    const delta = 0.5;
    const check = faker.get(Check);
    const fakeData = await faker.setData(check);

    await faker.setData(check, {
      acquisition_id: fakeData.acquisition_id,
      is_driver: true,
      end_position: {
        lat: fakeData.end_position.lat + delta,
        lon: fakeData.end_position.lon,
      },
    });

    const res = await check.handle(fakeData.acquisition_id);

    expect(res).to.have.all.keys(['meta', 'karma']);
    expect(res.karma).to.be.gt(0);
    expect(res.karma).to.be.lt(100);
    expect(res.meta).to.deep.eq({ delta });
  });
});
