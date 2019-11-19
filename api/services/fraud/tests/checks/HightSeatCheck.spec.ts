
import { describe } from 'mocha';
import { expect } from 'chai';
import { HighSeatCheck as Check } from '../../src/engine/checks/HighSeatCheck';

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
    const fakeData = await faker.setData(check, { seats: 8 });

    const res = await check.handle(fakeData.acquisition_id);

    expect(res).to.have.all.keys(['meta', 'karma']);
    expect(res.karma).to.be.eq(100);
  });

  it('works with min', async () => {
    const check = faker.get(Check);
    const fakeData = await faker.setData(check, { seats: 3 });

    const res = await check.handle(fakeData.acquisition_id);

    expect(res).to.have.all.keys(['meta', 'karma']);
    expect(res.karma).to.be.eq(0);
  });

  it('works between', async () => {
    const check = faker.get(Check);
    const fakeData = await faker.setData(check, { seats: 6 });

    const res = await check.handle(fakeData.acquisition_id);

    expect(res).to.have.all.keys(['meta', 'karma']);
    expect(res.karma).to.be.gt(0);
    expect(res.karma).to.be.lt(100);
  });
});