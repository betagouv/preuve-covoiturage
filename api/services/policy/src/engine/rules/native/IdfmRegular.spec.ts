import test from 'ava';

import { IdfmRegular } from './IdfmRegular';
import { faker } from '../../helpers/faker';
import { NotApplicableTargetException } from '../../exceptions/NotApplicableTargetException';

function setup(): {
  policy: IdfmRegular;
  defaultTripParams: { start_territory_id: number[]; end_territory_id: number[]; operator_id: number };
} {
  const policy = new IdfmRegular({
    territory_id: 1,
    paris_insee_code: [
      '75056',
      '75101',
      '75102',
      '75103',
      '75104',
      '75105',
      '75106',
      '75107',
      '75108',
      '75109',
      '75110',
      '75111',
      '75112',
      '75113',
      '75114',
      '75115',
      '75116',
      '75117',
      '75118',
      '75119',
      '75120',
    ],
  });

  const defaultTripParams = {
    start_territory_id: [1],
    end_territory_id: [1],
    operator_id: 3,
  };
  return { policy, defaultTripParams };
}

test.skip('case 1', async (t) => {
  const { policy, defaultTripParams } = setup();

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
    person: trip[0],
    trip,
  };
  await policy.apply(context);
  t.is(context.result, 150);
});

test.skip('case 2', async (t) => {
  const { policy, defaultTripParams } = setup();

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
    person: trip[0],
    trip,
  };
  await policy.apply(context);
  t.is(context.result, 170);
});
test.skip('case 3', async (t) => {
  const { policy, defaultTripParams } = setup();

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
    person: trip[0],
    trip,
  };
  await policy.apply(context);
  t.is(context.result, 300);
});
test.skip('case 4', async (t) => {
  const { policy, defaultTripParams } = setup();

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
    person: trip[0],
    trip,
  };
  await policy.apply(context);
  t.is(context.result, 190);
});
test.skip('case 5', async (t) => {
  const { policy, defaultTripParams } = setup();

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
    person: trip[0],
    trip,
  };
  await policy.apply(context);
  t.is(context.result, 150);
});
test.skip('case 6', async (t) => {
  const { policy, defaultTripParams } = setup();

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
    person: trip[0],
    trip,
  };
  await policy.apply(context);
  t.is(context.result, 300);
});
test.skip('case 7', async (t) => {
  const { policy, defaultTripParams } = setup();

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
    person: trip[0],
    trip,
  };
  await policy.apply(context);
  t.is(context.result, 500);
});

test.skip('case 8', async (t) => {
  const { policy, defaultTripParams } = setup();

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
    person: trip[0],
    trip,
  };
  await policy.apply(context);
  t.is(context.result, 400);
});

test.skip('case 9', async (t) => {
  const { policy, defaultTripParams } = setup();
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
    person: trip[0],
    trip,
  };
  await policy.apply(context);
  t.is(context.result, 550);
});
test.skip('case 10', async (t) => {
  const { policy, defaultTripParams } = setup();

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
    person: trip[0],
    trip,
  };
  await policy.apply(context);
  t.is(context.result, 600);
});
test.skip('case 11', async (t) => {
  const { policy, defaultTripParams } = setup();

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
    person: trip[0],
    trip,
  };
  await policy.apply(context);
  t.is(context.result, 370);
});

test.skip('case 12', async (t) => {
  const { policy, defaultTripParams } = setup();
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
    person: trip[0],
    trip,
  };
  await policy.apply(context);
  t.is(context.result, 800);
});

test.skip('case 13', async (t) => {
  const { policy, defaultTripParams } = setup();
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
    person: trip[0],
    trip,
  };
  await policy.apply(context);
  t.is(context.result, 150);
});

test.skip('case 14', async (t) => {
  const { policy, defaultTripParams } = setup();
  const trip = faker.trip([
    {
      ...defaultTripParams,
      is_driver: true,
      distance: 18948,
      cost: 0,
    },
    {
      ...defaultTripParams,
      is_driver: false,
      distance: 6, // makes it fail. passenger dist must be > 2000
      seats: 1,
      cost: 0,
    },
  ]);

  const context = {
    stack: [],
    result: 0,
    person: trip[0],
    trip,
  };

  await t.throwsAsync<NotApplicableTargetException>(async () => policy.apply(context));
});

test.skip('case 15', async (t) => {
  const { policy, defaultTripParams } = setup();
  const trip = faker.trip([
    {
      ...defaultTripParams,
      is_driver: true,
      distance: 15463,
      cost: 0,
    },
    {
      ...defaultTripParams,
      is_driver: false,
      distance: 15, // makes it fail. passenger dist must be > 2000
      seats: 1,
      cost: 0,
    },
  ]);

  const context = {
    stack: [],
    result: 0,
    person: trip[0],
    trip,
  };

  await t.throwsAsync<NotApplicableTargetException>(async () => policy.apply(context));
});
