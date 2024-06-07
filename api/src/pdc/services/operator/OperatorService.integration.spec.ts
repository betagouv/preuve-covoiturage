import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { httpMacro, HttpMacroContext } from '@/pdc/providers/test/index.ts';

import { ContextType } from '@/ilos/common/index.ts';
import { ServiceProvider } from './ServiceProvider.ts';

interface TestContext extends HttpMacroContext {
  _id: number;
}
const { before, after } = httpMacro<TestContext>(ServiceProvider);

const test = anyTest as TestFn<TestContext>;

beforeAll(async (t) => {
  const { transport, supertest, request } = await before();
  t.context.transport = transport;
  t.context.supertest = supertest;
  t.context.request = request;
});

afterAll(async (t) => {
  const { transport, supertest, request } = t.context;
  await after({ transport, supertest, request });
});

function contextFactory(permissions: string[]): ContextType {
  return {
    channel: {
      service: 'proxy',
      transport: 'node:http',
    },
    call: {
      user: {
        permissions,
      },
    },
  };
}

it('Fails on wrong permissions', async (t) => {
  const result = await t.context.request(
    'operator:create',
    {
      name: 'Toto',
      legal_name: 'Toto inc.',
    },
    contextFactory(['wrong.permission']),
  );
  assert('error' in result);
  assertEquals(result.error.data, 'Invalid permissions');
});

test.serial.skip('Create an operator', async (t) => {
  const result = await t.context.request(
    'operator:create',
    {
      name: 'Toto',
      legal_name: 'Toto inc.',
      siret: `${String(Math.random() * Math.pow(10, 16)).substr(0, 14)}`,
    },
    contextFactory(['registry.operator.create']),
  );
  t.log(result);
  assert('_id' in result.result);
  assertEquals(result.result.name, 'Toto');
  assertEquals(result.result.legal_name, 'Toto inc.');
  t.context._id = result.result._id;
});

test.serial.skip('Find an operator', async (t) => {
  const result = await t.context.request(
    'operator:find',
    {
      _id: t.context._id,
    },
    contextFactory(['operator.read']),
  );
  assert('_id' in result);
  assertEquals(result.name, 'Toto');
  assertEquals(result.legal_name, 'Toto inc.');
});

test.serial.skip('Update the operator', async (t) => {
  const result = await t.context.request(
    'operator:update',
    {
      _id: t.context._id,
      name: 'Yop',
    },
    contextFactory(['operator.update']),
  );
  assert('_id' in result);
  assertEquals(result.name, 'Yop');
  assertEquals(result.legal_name, 'Toto inc.');
});

test.serial.skip('List all operators', async (t) => {
  const result = await t.context.request('operator:list', {}, contextFactory(['operator.list']));
  assert(Array.isArray(result));
  const operator = result.filter((r) => r._id === t.context._id);
  assertEquals(operator.length, 1);
  assertEquals(operator[0]._id, t.context._id);
  assertEquals(operator[0].name, 'Yop');
});

test.serial.skip('Delete the operator', async (t) => {
  const result = await t.context.request(
    'operator:delete',
    { _id: t.context._id },
    contextFactory(['operator.delete']),
  );
  assertEquals(result, null);
});
