import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { httpMacro, HttpMacroContext } from '@/pdc/providers/test/index.ts';
import { ServiceProvider } from './ServiceProvider.ts';

interface TestContext extends HttpMacroContext {
  application: any;
  operator_id: number;
}

const test = anyTest as TestFn<TestContext>;
const { before, after } = httpMacro<TestContext>(ServiceProvider);

beforeAll(async (t) => {
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

it('#1 - Creates an application', async (t) => {
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

  assert('uuid' in response.result);
  assertEquals(response.result.name, 'Application');
  assertEquals(response.result.owner_id, t.context.operator_id);
  assertEquals(response.result.owner_service, 'operator');
  application_test_context = response.result;
});

it('#2.0 - Find the application by id', async (t) => {
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
  assertEquals(response.result.uuid, application_test_context.uuid);
  assertEquals(response.result.name, 'Application');
  assertEquals(response.result.owner_id, t.context.operator_id);
  assertEquals(response.result.owner_service, 'operator');
});

it('#2.1 - Fails if no owner set', async (t) => {
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

  assert('error' in response);
  assertEquals(response.error.code, -32503);
  assertEquals(response.error.message, 'Forbidden Error');
  assertEquals(response.error.data, 'Invalid permissions');
});

test.serial.skip("#3.0 - Cannot revoke another op's app", async (t) => {
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
  assert('error' in result);
});

it('#3.1 - Revoke the application OK', async (t) => {
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
  assertEquals(result.result, undefined);
});

it('#3.2 - Cannot revoke twice the same app', async (t) => {
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
  assert('error' in result);
});

it('#4 - List applications', async (t) => {
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
  assert(Array.isArray(result.result));
  assertEquals(result.result.length, 2);
  const sortedResults = result.result.sort((a, b) => (a._id > b._id ? 1 : -1));
  assertEquals(sortedResults[0].name, 'Application A');
  assertEquals(sortedResults[1].name, 'Application B');
});
