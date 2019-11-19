
import { describe } from 'mocha';
import { expect } from 'chai';
import { HighDurationCheck as Check } from '../../src/engine/checks/HighDurationCheck';

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
    const fakeData = await faker.setData(check, { duration: 432000 });
    await faker.setData(check, { acquisition_id: fakeData.acquisition_id, duration: 432000, is_driver: true });

    const res = await check.handle(fakeData.acquisition_id);

    expect(res).to.have.all.keys(['meta', 'karma']);
    expect(res.karma).to.be.eq(100);
  });

  it('works with min', async () => {
    const check = faker.get(Check);
    const fakeData = await faker.setData(check, { duration: 6200 });
    await faker.setData(check, { acquisition_id: fakeData.acquisition_id, duration: 6200, is_driver: true });

    const res = await check.handle(fakeData.acquisition_id);

    expect(res).to.have.all.keys(['meta', 'karma']);
    expect(res.karma).to.be.eq(0);
  });

  it('works between', async () => {
    const check = faker.get(Check);
    const fakeData = await faker.setData(check, { duration: 10200 });
    await faker.setData(check, { acquisition_id: fakeData.acquisition_id, duration: 10200, is_driver: true });

    const res = await check.handle(fakeData.acquisition_id);

    expect(res).to.have.all.keys(['meta', 'karma']);
    expect(res.karma).to.be.gt(0);
    expect(res.karma).to.be.lt(100);
  });
});