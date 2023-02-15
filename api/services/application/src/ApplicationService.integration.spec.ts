import anyTest, { TestFn } from 'ava';
import { httpMacro, HttpMacroContext } from '@pdc/helper-test';

import { bootstrap } from './bootstrap';

interface TestContext extends HttpMacroContext {
  application: any;
  operator_id: number;
}

const test = anyTest as TestFn<TestContext>;
const { before, after } = httpMacro<TestContext>(() => bootstrap.boot('http', 0));

test.before(async (t) => {
  const { transport, supertest, request } = await before();
  t.context.transport = transport;
  t.context.supertest = supertest;
  t.context.request = request;
  t.context.operator_id = Math.round(Math.random() * 1000);
});

test.after.always(async (t) => {
  const { transport, supertest, request } = t.context;
  await after({ transport, supertest, request });
});

let application_test_context: any;

test.serial('#1 - Creates an application', async (t) => {
  const response = await t.context.request(
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

  t.true('uuid' in response.result);
  t.is(response.result.name, 'Application');
  t.is(response.result.owner_id, t.context.operator_id);
  t.is(response.result.owner_service, 'operator');
  application_test_context = response.result;
});

test.serial('#2.0 - Find the application by id', async (t) => {
  const response = await t.context.request(
    'application:find',
    {
      uuid: application_test_context.uuid,
      owner_id: application_test_context.owner_id,
      owner_service: application_test_context.owner_service,
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
  t.is(response.result.uuid, application_test_context.uuid);
  t.is(response.result.name, 'Application');
  t.is(response.result.owner_id, t.context.operator_id);
  t.is(response.result.owner_service, 'operator');
});

test.serial('#2.1 - Fails if no owner set', async (t) => {
  const response = await t.context.request(
    'application:find',
    {
      uuid: application_test_context.uuid,
      owner_service: application_test_context.owner_service,
    },
    {
      call: {
        user: {
          permissions: ['operator.application.find'],
        },
      },
    },
  );

  t.true('error' in response);
  t.is(response.error.code, -32503);
  t.is(response.error.message, 'Forbidden Error');
  t.is(response.error.data, 'Invalid permissions');
});

test.serial("#3.0 - Cannot revoke another op's app", async (t) => {
  const result = await t.context.request(
    'application:revoke',
    {
      uuid: application_test_context.uuid,
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

test.serial('#3.1 - Revoke the application OK', async (t) => {
  const result = await t.context.request(
    'application:revoke',
    {
      uuid: application_test_context.uuid,
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
  t.is(result.result, undefined);
});

test.serial('#3.2 - Cannot revoke twice the same app', async (t) => {
  const result = await t.context.request(
    'application:revoke',
    { uuid: application_test_context.uuid },
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

test.serial('#4 - List applications', async (t) => {
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
  t.true(Array.isArray(result.result));
  t.is(result.result.length, 2);
  const sortedResults = result.result.sort((a, b) => (a._id > b._id ? 1 : -1));
  t.is(sortedResults[0].name, 'Application A');
  t.is(sortedResults[1].name, 'Application B');
});
