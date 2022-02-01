import anyTest, { TestFn } from 'ava';
import { httpMacro, HttpMacroContext } from '@pdc/helper-test';

import { bootstrap } from './bootstrap';

interface TestContext extends HttpMacroContext {
  application: any;
  operator_id: number;
}

const test = anyTest as TestFn<TestContext>;
const { before, after } = httpMacro<TestContext>(() => bootstrap.boot('http', 0));

test.before.skip(async (t) => {
  const { transport, supertest, request } = await before();
  t.context.transport = transport;
  t.context.supertest = supertest;
  t.context.request = request;
  t.context.operator_id = Math.round(Math.random() * 1000);
});

test.after.always.skip(async (t) => {
  const { transport, supertest, request } = t.context;
  await after({ transport, supertest, request });
});

test.serial.skip('#1 - Creates an application', async (t) => {
  const result = await t.context.request(
    'application:create',
    {
      name: 'Application',
    },
    {
      call: {
        user: {
          operator_id: t.context.operator_id,
          permissions: ['operator.application.create'],
        },
      },
    },
  );
  t.true('uuid' in result);
  t.is(result.name, 'Application');
  t.is(result.owner_id, t.context.operator_id);
  t.is(result.owner_service, 'operator');
  t.context.application = result;
});

test.serial.skip('#2.0 - Find the application by id', async (t) => {
  const result = await t.context.request(
    'application:find',
    {
      uuid: t.context.application.uuid,
      owner_id: t.context.application.owner_id,
      owner_service: t.context.application.owner_service,
    },
    {
      call: {
        user: {
          operator_id: t.context.operator_id,
          permissions: ['operator.application.find'],
        },
      },
    },
  );
  t.is(result.uuid, t.context.application.uuid);
  t.is(result.name, 'Application');
  t.is(result.owner_id, t.context.operator_id);
  t.is(result.owner_service, 'operator');
});

test.serial.skip('#2.1 - Fails if no owner set', async (t) => {
  const result = await t.context.request(
    'application:find',
    {
      uuid: t.context.application.uuid,
      // owner_id: application.owner_id,
      owner_service: t.context.application.owner_service,
    },
    {
      call: {
        user: {
          permissions: ['operator.application.find'],
        },
      },
    },
  );

  t.true('error' in result);
  t.is(result.error.code, -32602);
  t.is(result.error.message, 'Invalid params');
  t.is(result.error.data, 'Application owner service must be set');
});

test.serial.skip("#3.0 - Cannot revoke another op's app", async (t) => {
  const result = await t.context.request(
    'application:revoke',
    {
      uuid: t.context.application.uuid,
    },
    {
      call: {
        user: {
          operator_id: String(t.context.operator_id).split('').reverse().join(''),
          permissions: ['operator.application.revoke'],
        },
      },
    },
  );
  t.true('error' in result);
});

test.serial.skip('#3.1 - Revoke the application OK', async (t) => {
  const result = await t.context.request(
    'application:revoke',
    {
      uuid: t.context.application.uuid,
    },
    {
      call: {
        user: {
          operator_id: t.context.operator_id,
          permissions: ['operator.application.revoke'],
        },
      },
    },
  );
  t.is(result, null);
});

test.serial.skip('#3.2 - Cannot revoke twice the same app', async (t) => {
  const result = await t.context.request(
    'application:revoke',
    { uuid: t.context.application.uuid },
    {
      call: {
        user: {
          operator_id: t.context.operator_id,
          permissions: ['operator.application.revoke'],
        },
      },
    },
  );
  t.true('error' in result);
});

test.serial.skip('#4 - List applications', async (t) => {
  await t.context.request(
    'application:create',
    {
      name: 'Application A',
    },
    {
      call: {
        user: {
          operator_id: t.context.operator_id,
          permissions: ['operator.application.create'],
        },
      },
    },
  );
  await t.context.request(
    'application:create',
    {
      name: 'Application B',
    },
    {
      call: {
        user: {
          operator_id: t.context.operator_id,
          permissions: ['operator.application.create'],
        },
      },
    },
  );
  const result = await t.context.request(
    'application:list',
    {},
    {
      call: {
        user: {
          operator_id: t.context.operator_id,
          permissions: ['operator.application.list'],
        },
      },
    },
  );
  t.true(Array.isArray(result));
  t.is(result.length, 2);
  const sortedResults = result.sort((a, b) => (a._id > b._id ? 1 : -1));
  t.is(sortedResults[0].name, 'Application A');
  t.is(sortedResults[1].name, 'Application B');
});
