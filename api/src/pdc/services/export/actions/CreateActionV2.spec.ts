import { ContextType, KernelInterfaceResolver } from '@ilos/common';
import { ParamsInterfaceV2, ParamsInterfaceV3 } from '@shared/export/create.contract';
import anyTest, { TestFn } from 'ava';
import { SinonStub, stub } from 'sinon';
import { CreateActionV2 } from './CreateActionV2';

// ----------------------------------------------------------------------------------------
// SETUP
// ----------------------------------------------------------------------------------------

type Context = {
  kernel: KernelInterfaceResolver;
  stubs: SinonStub[];
};

const test = anyTest as TestFn<Context>;

test.before((t) => {
  t.context.kernel = new (class extends KernelInterfaceResolver {})();
  t.context.stubs = [];
});

test.after((t) => {
  for (const stub of t.context.stubs) {
    stub.restore();
  }
});

// ----------------------------------------------------------------------------------------
// TESTS
// ----------------------------------------------------------------------------------------

test('CreateActionV2 should convert params to V3', async (t) => {
  // stub kernel.call to return the params
  t.context.stubs.push(
    stub(t.context.kernel, 'call').callsFake((signature, params) => new Promise((resolve) => resolve(params))),
  );

  const configs: Array<{ context: ContextType; v2: ParamsInterfaceV2; v3: ParamsInterfaceV3 }> = [
    // default call with minimum params
    {
      context: {
        channel: { service: 'test' },
        call: { user: { _id: 1000 } },
      },
      v2: {
        tz: 'Europe/Paris',
        date: { start: new Date('2021-01-01'), end: new Date('2021-01-31') },
      },
      v3: {
        tz: 'Europe/Paris',
        start_at: new Date('2021-01-01'),
        end_at: new Date('2021-01-31'),
        operator_id: [],
        created_by: 1000,
      },
    },

    // pass an operator_id in the list
    {
      context: {
        channel: { service: 'test' },
        call: { user: { _id: 1001 } },
      },
      v2: {
        tz: 'Europe/Paris',
        date: { start: new Date('2021-01-01'), end: new Date('2021-01-31') },
        operator_id: [1],
      },
      v3: {
        tz: 'Europe/Paris',
        start_at: new Date('2021-01-01'),
        end_at: new Date('2021-01-31'),
        operator_id: [1],
        created_by: 1001,
      },
    },

    // operator_id is taken from the context
    {
      context: {
        channel: { service: 'test' },
        call: { user: { _id: 1002, operator_id: 1 } },
      },
      v2: {
        tz: 'Europe/Paris',
        date: { start: new Date('2021-01-01'), end: new Date('2021-01-31') },
      },
      v3: {
        tz: 'Europe/Paris',
        start_at: new Date('2021-01-01'),
        end_at: new Date('2021-01-31'),
        operator_id: [], // ERROR. should be [1] with active middlewares
        created_by: 1002,
      },
    },

    // territory_id is taken from the context
    // it sets the target to TERRITORY but does not set the geo_selector
    {
      context: {
        channel: { service: 'test' },
        call: { user: { _id: 1003, territory_id: 1 } },
      },
      v2: {
        tz: 'Europe/Paris',
        date: { start: new Date('2021-01-01'), end: new Date('2021-01-31') },
      },
      v3: {
        tz: 'Europe/Paris',
        start_at: new Date('2021-01-01'),
        end_at: new Date('2021-01-31'),
        operator_id: [],
        created_by: 1003,
      },
    },
  ];

  // run the tests
  for (const { v2, v3, context } of configs) {
    const action = new CreateActionV2(t.context.kernel);
    t.deepEqual(await action['handle'](v2, context), v3);
  }
});
