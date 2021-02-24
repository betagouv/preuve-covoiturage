import anyTest from 'ava';
import { httpMacro } from '@pdc/helper-test';

import { bootstrap } from '../src/bootstrap';

interface TestContext {
  _id: number;
}

const { test } = httpMacro<TestContext>(anyTest, () => bootstrap.boot('http', 0));

test.serial('Create a territory', async (t) => {
  const result = await t.context.request(
    'territory:create',
    {
      name: 'Toto',
      siret: `${String(Math.random() * Math.pow(10, 16)).substr(0, 14)}`,
    },
    {
      call: {
        user: {
          permissions: ['territory.create'],
        },
      },
    },
  );
  t.true('_id' in result);
  t.is(result.name, 'Toto');
  t.context._id = result._id;
});
test.serial('Find a territory', async (t) => {
  const result = await t.context.request(
    'territory:find',
    { _id: t.context._id },
    {
      call: {
        user: {
          permissions: ['territory.read'],
        },
      },
    },
  );
  t.true('_id' in result);
  t.is(result.name, 'Toto');
});

test.serial('Update a territory', async (t) => {
  const result = await t.context.request(
    'territory:update',
    {
      _id: t.context._id,
      name: 'Yop',
    },
    {
      call: {
        user: {
          permissions: ['territory.update'],
        },
      },
    },
  );
  t.is(result._id, t.context._id);
  t.is(result.name, 'Yop');
});

test.serial('Lists all territories', async (t) => {
  const result = await t.context.request(
    'territory:list',
    {},
    {
      call: {
        user: {
          permissions: ['territory.list'],
        },
      },
    },
  );
  t.true('data' in result);
  t.true(Array.isArray(result.data));
  const territory = result.data.filter((r) => r._id === t.context._id);
  t.is(territory.length, 1);
  t.is(territory[0]._id, t.context._id);
  t.is(territory[0].name, 'Yop');
});

test.serial('Deletes the territory', async (t) => {
  const result = await t.context.request(
    'territory:delete',
    { _id: t.context._id },
    {
      call: {
        user: {
          permissions: ['territory.delete'],
        },
      },
    },
  );
  t.is(result, null);
});
