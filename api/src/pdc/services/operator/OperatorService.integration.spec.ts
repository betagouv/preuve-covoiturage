import anyTest, { TestFn } from 'ava';
import { httpMacro, HttpMacroContext } from '@pdc/providers/test/index.ts';

import { ContextType } from '@ilos/common/index.ts';
import { ServiceProvider } from './ServiceProvider.ts';

interface TestContext extends HttpMacroContext {
  _id: number;
}
const { before, after } = httpMacro<TestContext>(ServiceProvider);

const test = anyTest as TestFn<TestContext>;

test.before(async (t) => {
  const { transport, supertest, request } = await before();
  t.context.transport = transport;
  t.context.supertest = supertest;
  t.context.request = request;
});

test.after(async (t) => {
  const { transport, supertest, request } = t.context;
  await after({ transport, supertest, request });
});

function contextFactory(permissions: string[]): ContextType {
  return {
    channel: {
      service: 'proxy',
      transport: 'http',
    },
    call: {
      user: {
        permissions,
      },
    },
  };
}

test.serial('Fails on wrong permissions', async (t) => {
  const result = await t.context.request(
    'operator:create',
    {
      name: 'Toto',
      legal_name: 'Toto inc.',
    },
    contextFactory(['wrong.permission']),
  );
  t.true('error' in result);
  t.is(result.error.data, 'Invalid permissions');
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
  t.true('_id' in result.result);
  t.is(result.result.name, 'Toto');
  t.is(result.result.legal_name, 'Toto inc.');
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
  t.true('_id' in result);
  t.is(result.name, 'Toto');
  t.is(result.legal_name, 'Toto inc.');
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
  t.true('_id' in result);
  t.is(result.name, 'Yop');
  t.is(result.legal_name, 'Toto inc.');
});

test.serial.skip('List all operators', async (t) => {
  const result = await t.context.request('operator:list', {}, contextFactory(['operator.list']));
  t.true(Array.isArray(result));
  const operator = result.filter((r) => r._id === t.context._id);
  t.is(operator.length, 1);
  t.is(operator[0]._id, t.context._id);
  t.is(operator[0].name, 'Yop');
});

test.serial.skip('Delete the operator', async (t) => {
  const result = await t.context.request(
    'operator:delete',
    { _id: t.context._id },
    contextFactory(['operator.delete']),
  );
  t.is(result, null);
});
