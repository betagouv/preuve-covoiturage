import { describe } from 'mocha';
import { expect } from 'chai';
import { StartEndLatitudeCollisionCheck as Check } from '../../src/engine/checks/StartEndLatitudeCollisionCheck';

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
    const delta = 0;
    const position = {
      lat: 48.851047,
      lon: 2.309339,
    };

    const check = faker.get(Check);
    const fakeData = await faker.setData(check, {
      start_position: {
        ...position,
        lat: position.lat + delta,
      },
      end_position: { ...position },
    });
    await faker.setData(check, {
      acquisition_id: fakeData.acquisition_id,
      is_driver: true,
      start_position: {
        ...position,
        lat: position.lat + delta,
      },
      end_position: { ...position },
    });

    const res = await check.handle(fakeData.acquisition_id);

    expect(res).to.have.all.keys(['meta', 'karma']);
    expect(res.karma).to.be.eq(100);
    expect(res.meta).to.be.an('array');
    expect(res.meta.length).to.eq(2);
    expect(res.meta[0]).to.have.property('delta');
    expect(res.meta[0].delta).to.closeTo(delta, 0.0001);
    expect(res.meta[1]).to.have.property('delta');
    expect(res.meta[1].delta).to.closeTo(delta, 0.0001);
  });

  it('works with min', async () => {
    const delta = 0.01;
    const position = {
      lat: 48.851047,
      lon: 2.309339,
    };
    const check = faker.get(Check);
    const fakeData = await faker.setData(check, {
      start_position: {
        ...position,
        lat: position.lat + delta,
      },
      end_position: { ...position },
    });

    await faker.setData(check, {
      acquisition_id: fakeData.acquisition_id,
      is_driver: true,
      start_position: {
        ...position,
        lat: position.lat + delta,
      },
      end_position: { ...position },
    });

    const res = await check.handle(fakeData.acquisition_id);

    expect(res).to.have.all.keys(['meta', 'karma']);
    expect(res.karma).to.be.eq(0);
    expect(res.meta).to.be.an('array');
    expect(res.meta.length).to.eq(2);
    expect(res.meta[0]).to.have.property('delta');
    expect(res.meta[0].delta).to.closeTo(delta, 0.0001);
    expect(res.meta[1]).to.have.property('delta');
    expect(res.meta[1].delta).to.closeTo(delta, 0.0001);
  });

  it('works between', async () => {
    const delta = 0.0005;
    const position = {
      lat: 48.851047,
      lon: 2.309339,
    };
    const check = faker.get(Check);
    const fakeData = await faker.setData(check, {
      start_position: {
        ...position,
        lat: position.lat + delta,
      },
      end_position: { ...position },
    });

    await faker.setData(check, {
      acquisition_id: fakeData.acquisition_id,
      is_driver: true,
      start_position: {
        ...position,
        lat: position.lat + delta,
      },
      end_position: { ...position },
    });

    const res = await check.handle(fakeData.acquisition_id);

    expect(res).to.have.all.keys(['meta', 'karma']);
    expect(res.karma).to.be.gt(0);
    expect(res.karma).to.be.lt(100);
    expect(res.meta).to.be.an('array');
    expect(res.meta.length).to.eq(2);
    expect(res.meta[0]).to.have.property('delta');
    expect(res.meta[0].delta).to.closeTo(delta, 0.0001);
    expect(res.meta[1]).to.have.property('delta');
    expect(res.meta[1].delta).to.closeTo(delta, 0.0001);
  });
});