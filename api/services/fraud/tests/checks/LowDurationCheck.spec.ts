
import { describe } from 'mocha';
import { expect } from 'chai';
import { LowDurationCheck as Check } from '../../src/engine/checks/LowDurationCheck';

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
    const durationSet = { duration: 0 };
    const check = faker.get(Check);
    const fakeData = await faker.setData(check, durationSet);
    await faker.setData(check, { ...durationSet, acquisition_id: fakeData.acquisition_id, is_driver: true });

    const res = await check.handle(fakeData.acquisition_id);

    expect(res).to.have.all.keys(['meta', 'karma']);
    expect(res.karma).to.be.eq(100);
    expect(res.meta).to.deep.eq([durationSet, durationSet]);
  });

  it('works with min', async () => {
    const durationSet = { duration: 300 };
    const check = faker.get(Check);
    const fakeData = await faker.setData(check, durationSet);
    await faker.setData(check, { ...durationSet, acquisition_id: fakeData.acquisition_id, is_driver: true });

    const res = await check.handle(fakeData.acquisition_id);

    expect(res).to.have.all.keys(['meta', 'karma']);
    expect(res.karma).to.be.eq(0);
    expect(res.meta).to.deep.eq([durationSet, durationSet]);
  });

  it('works between', async () => {
    const durationSet = { duration: 150 };
    const check = faker.get(Check);
    const fakeData = await faker.setData(check, durationSet);
    await faker.setData(check, { ...durationSet, acquisition_id: fakeData.acquisition_id, is_driver: true });

    const res = await check.handle(fakeData.acquisition_id);

    expect(res).to.have.all.keys(['meta', 'karma']);
    expect(res.karma).to.be.gt(0);
    expect(res.karma).to.be.lt(100);
    expect(res.meta).to.deep.eq([durationSet, durationSet]);
  });
});