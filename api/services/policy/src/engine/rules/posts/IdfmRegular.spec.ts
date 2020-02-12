import chai from 'chai';
import chaiAsync from 'chai-as-promised';
import { describe } from 'mocha';

import { IdfmRegular } from './IdfmRegular';
import { MetadataWrapper } from '../../MetadataWrapper';
import { faker } from '../../helpers/faker';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';

const meta = new MetadataWrapper(1, 'default', {});

chai.use(chaiAsync);
const { expect } = chai;
const test = new IdfmRegular({
  territory_id: 11,
  paris_insee_code: ['75115', '75116'],
});

const defaultTripParams = {
  start_territory_id: 11,
  end_territory_id: 11,
};

describe('Policy rule: IdfmRegular', () => {
  it('case 0', async () => {
    const trip = faker.trip([
      {
        ...defaultTripParams,
        is_driver: true,
        distance: 1000,
      },
      {
        ...defaultTripParams,
        is_driver: false,
        distance: 1000,
      },
      {
        ...defaultTripParams,
        is_driver: false,
        distance: 5000,
        start_insee: '75115',
        end_insee: '75116',
      },
    ]);

    const context = {
      stack: [],
      result: 0,
      person: trip.people[0],
      trip,
      meta,
    };

    await expect(test.apply(context)).to.rejectedWith(NotApplicableTargetException);
  });
  it('case 1', async () => {
    const trip = faker.trip([
      {
        ...defaultTripParams,
        is_driver: true,
        distance: 5000,
      },
      {
        ...defaultTripParams,
        is_driver: false,
        distance: 5000,
        seats: 1,
      },
    ]);

    const context = {
      stack: [],
      result: 0,
      person: trip.people[0],
      trip,
      meta,
    };
    await test.apply(context);
    expect(context.result).to.eq(150);
  });

  it('case 2', async () => {
    const trip = faker.trip([
      {
        ...defaultTripParams,
        is_driver: true,
        distance: 17000,
      },
      {
        ...defaultTripParams,
        is_driver: false,
        distance: 17000,
        seats: 1,
      },
    ]);

    const context = {
      stack: [],
      result: 0,
      person: trip.people[0],
      trip,
      meta,
    };
    await test.apply(context);
    expect(context.result).to.eq(170);
  });
  it('case 3', async () => {
    const trip = faker.trip([
      {
        ...defaultTripParams,
        is_driver: true,
        distance: 45000,
      },
      {
        ...defaultTripParams,
        is_driver: false,
        distance: 45000,
        seats: 1,
      },
    ]);

    const context = {
      stack: [],
      result: 0,
      person: trip.people[0],
      trip,
      meta,
    };
    await test.apply(context);
    expect(context.result).to.eq(300);
  });
  it('case 4', async () => {
    const trip = faker.trip([
      {
        ...defaultTripParams,
        is_driver: true,
        distance: 10000,
      },
      {
        ...defaultTripParams,
        is_driver: false,
        distance: 10000,
        seats: 1,
      },
      {
        ...defaultTripParams,
        is_driver: false,
        distance: 9000,
        seats: 1,
      },
    ]);

    const context = {
      stack: [],
      result: 0,
      person: trip.people[0],
      trip,
      meta,
    };
    await test.apply(context);
    expect(context.result).to.eq(190);
  });
  it('case 5', async () => {
    const trip = faker.trip([
      {
        ...defaultTripParams,
        is_driver: true,
        distance: 5000,
      },
      {
        ...defaultTripParams,
        is_driver: false,
        distance: 5000,
        seats: 1,
      },
      {
        ...defaultTripParams,
        is_driver: false,
        distance: 6000,
        seats: 1,
      },
    ]);

    const context = {
      stack: [],
      result: 0,
      person: trip.people[0],
      trip,
      meta,
    };
    await test.apply(context);
    expect(context.result).to.eq(150);
  });
  it('case 6', async () => {
    const trip = faker.trip([
      {
        ...defaultTripParams,
        is_driver: true,
        distance: 13000,
      },
      {
        ...defaultTripParams,
        is_driver: false,
        distance: 13000,
        seats: 1,
      },
      {
        ...defaultTripParams,
        is_driver: false,
        distance: 17000,
        seats: 1,
      },
    ]);

    const context = {
      stack: [],
      result: 0,
      person: trip.people[0],
      trip,
      meta,
    };
    await test.apply(context);
    expect(context.result).to.eq(300);
  });
  it('case 7', async () => {
    const trip = faker.trip([
      {
        ...defaultTripParams,
        is_driver: true,
        distance: 25000,
      },
      {
        ...defaultTripParams,
        is_driver: false,
        distance: 25000,
        seats: 1,
      },
      {
        ...defaultTripParams,
        is_driver: false,
        distance: 25000,
        seats: 1,
      },
    ]);

    const context = {
      stack: [],
      result: 0,
      person: trip.people[0],
      trip,
      meta,
    };
    await test.apply(context);
    expect(context.result).to.eq(500);
  });

  it('case 8', async () => {
    const trip = faker.trip([
      {
        ...defaultTripParams,
        is_driver: true,
        distance: 10000,
      },
      {
        ...defaultTripParams,
        is_driver: false,
        distance: 10000,
        seats: 1,
      },
      {
        ...defaultTripParams,
        is_driver: false,
        distance: 36000,
        seats: 1,
      },
    ]);

    const context = {
      stack: [],
      result: 0,
      person: trip.people[0],
      trip,
      meta,
    };
    await test.apply(context);
    expect(context.result).to.eq(400);
  });

  it('case 9', async () => {
    const trip = faker.trip([
      {
        ...defaultTripParams,
        is_driver: true,
        distance: 25000,
      },
      {
        ...defaultTripParams,
        is_driver: false,
        distance: 25000,
        seats: 1,
      },
      {
        ...defaultTripParams,
        is_driver: false,
        distance: 36000,
        seats: 1,
      },
    ]);

    const context = {
      stack: [],
      result: 0,
      person: trip.people[0],
      trip,
      meta,
    };
    await test.apply(context);
    expect(context.result).to.eq(550);
  });
  it('case 10', async () => {
    const trip = faker.trip([
      {
        ...defaultTripParams,
        is_driver: true,
        distance: 36000,
      },
      {
        ...defaultTripParams,
        is_driver: false,
        distance: 36000,
        seats: 1,
      },
      {
        ...defaultTripParams,
        is_driver: false,
        distance: 36000,
        seats: 1,
      },
    ]);

    const context = {
      stack: [],
      result: 0,
      person: trip.people[0],
      trip,
      meta,
    };
    await test.apply(context);
    expect(context.result).to.eq(600);
  });
  it('case 11', async () => {
    const trip = faker.trip([
      {
        ...defaultTripParams,
        is_driver: true,
        distance: 5000,
      },
      {
        ...defaultTripParams,
        is_driver: false,
        distance: 5000,
        seats: 1,
      },
      {
        ...defaultTripParams,
        is_driver: false,
        distance: 16000,
        seats: 1,
      },
      {
        ...defaultTripParams,
        is_driver: false,
        distance: 16000,
        seats: 1,
      },
    ]);

    const context = {
      stack: [],
      result: 0,
      person: trip.people[0],
      trip,
      meta,
    };
    await test.apply(context);
    expect(context.result).to.eq(370);
  });

  it('case 12', async () => {
    const trip = faker.trip([
      {
        ...defaultTripParams,
        is_driver: true,
        distance: 25000,
      },
      {
        ...defaultTripParams,
        is_driver: false,
        distance: 25000,
        seats: 1,
      },
      {
        ...defaultTripParams,
        is_driver: false,
        distance: 25000,
        seats: 1,
      },
      {
        ...defaultTripParams,
        is_driver: false,
        distance: 32000,
        seats: 1,
      },
    ]);

    const context = {
      stack: [],
      result: 0,
      person: trip.people[0],
      trip,
      meta,
    };
    await test.apply(context);
    expect(context.result).to.eq(800);
  });

  it('case 13', async () => {
    const trip = faker.trip([
      {
        ...defaultTripParams,
        is_driver: true,
        distance: 4025,
        cost: -200,
      },
      {
        ...defaultTripParams,
        is_driver: false,
        distance: 4025,
        seats: 1,
        cost: 300,
      },
      {
        ...defaultTripParams,
        is_driver: false,
        distance: 4038,
        seats: 1,
        cost: 300,
      },
    ]);

    const context = {
      stack: [],
      result: 0,
      person: trip.people[0],
      trip,
      meta,
    };
    await test.apply(context);
    expect(context.result).to.eq(150);
  });
});
