import { describe } from 'mocha';
import { expect } from 'chai';
import { HighSeatCheck as Check } from '../../engine/checks/HighSeatCheck';

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
    const seatsSet = { seats: 8 };
    const check = faker.get(Check);
    const fakeData = await faker.setData(check, seatsSet);

    const res = await check.handle(fakeData.acquisition_id);

    expect(res).to.have.all.keys(['meta', 'karma']);
    expect(res.karma).to.be.eq(100);
    expect(res.meta).to.deep.eq(seatsSet);
  });

  it('works with min', async () => {
    const seatsSet = { seats: 3 };
    const check = faker.get(Check);
    const fakeData = await faker.setData(check, seatsSet);

    const res = await check.handle(fakeData.acquisition_id);

    expect(res).to.have.all.keys(['meta', 'karma']);
    expect(res.karma).to.be.eq(0);
    expect(res.meta).to.deep.eq(seatsSet);
  });

  it('works between', async () => {
    const seatsSet = { seats: 6 };
    const check = faker.get(Check);
    const fakeData = await faker.setData(check, seatsSet);

    const res = await check.handle(fakeData.acquisition_id);

    expect(res).to.have.all.keys(['meta', 'karma']);
    expect(res.karma).to.be.gt(0);
    expect(res.karma).to.be.lt(100);
    expect(res.meta).to.deep.eq(seatsSet);
  });
});
