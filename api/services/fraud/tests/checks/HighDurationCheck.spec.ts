import { describe } from 'mocha';
import { expect } from 'chai';
import { HighDurationCheck as Check } from '../../src/engine/checks/HighDurationCheck';

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
    const durationSet = { duration: 432000 };
    const check = faker.get(Check);
    const fakeData = await faker.setData(check, durationSet);
    await faker.setData(check, { ...durationSet, acquisition_id: fakeData.acquisition_id, is_driver: true });

    const res = await check.handle(fakeData.acquisition_id);

    expect(res).to.have.all.keys(['meta', 'karma']);
    expect(res.karma).to.be.eq(100);
    expect(res.meta).to.be.an('array');
    expect(res.meta[0]).to.deep.eq(durationSet);
    expect(res.meta[1]).to.deep.eq(durationSet);
  });

  it('works with min', async () => {
    const durationSet = { duration: 6200 };

    const check = faker.get(Check);
    const fakeData = await faker.setData(check, durationSet);
    await faker.setData(check, { ...durationSet, acquisition_id: fakeData.acquisition_id, is_driver: true });

    const res = await check.handle(fakeData.acquisition_id);

    expect(res).to.have.all.keys(['meta', 'karma']);
    expect(res.karma).to.be.eq(0);
    expect(res.meta).to.be.an('array');
    expect(res.meta[0]).to.deep.eq(durationSet);
    expect(res.meta[1]).to.deep.eq(durationSet);
  });

  it('works between', async () => {
    const durationSet = { duration: 10200 };
    const check = faker.get(Check);
    const fakeData = await faker.setData(check, durationSet);
    await faker.setData(check, { ...durationSet, acquisition_id: fakeData.acquisition_id, is_driver: true });

    const res = await check.handle(fakeData.acquisition_id);

    expect(res).to.have.all.keys(['meta', 'karma']);
    expect(res.karma).to.be.gt(0);
    expect(res.karma).to.be.lt(100);
    expect(res.meta).to.be.an('array');
    expect(res.meta[0]).to.deep.eq(durationSet);
    expect(res.meta[1]).to.deep.eq(durationSet);
  });
});
