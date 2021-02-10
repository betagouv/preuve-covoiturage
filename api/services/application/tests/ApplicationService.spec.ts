import anyTest from 'ava';
import { httpMacro } from '@pdc/helper-test';

import { bootstrap } from '../src/bootstrap';

interface TestContext {
  application: any;
  operator_id: number;
}

const { test } = httpMacro<TestContext>(anyTest, () => bootstrap.boot('http', 0));

test.before((t) => {
  t.context.operator_id = Math.round(Math.random() * 1000);
});

test.serial('#1 - Creates an application', async (t) => {
  const result = await t.context.request(
    'application:create',
    {
      name: 'Application',
    },
    {
      call: {
        user: {
          operator_id: t.context.operator_id,
          permissions: ['application.create'],
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

test.serial('#2.0 - Find the application by id', async (t) => {
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
          permissions: ['application.find'],
        },
      },
    },
  );
  t.is(result.uuid, t.context.application.uuid);
  t.is(result.name, 'Application');
  t.is(result.owner_id, t.context.operator_id);
  t.is(result.owner_service, 'operator');
});

test.serial('#2.1 - Fails if no owner set', async (t) => {
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
          permissions: ['application.find'],
        },
      },
    },
  );

  t.true('error' in result);
  t.is(result.error.code, -32602);
  t.is(result.error.message, 'Invalid params');
  t.is(result.error.data, 'Application owner service must be set');
});

test.serial("#3.0 - Cannot revoke another op's app", async (t) => {
  const result = await t.context.request(
    'application:revoke',
    {
      uuid: t.context.application.uuid,
    },
    {
      call: {
        user: {
          operator_id: String(t.context.operator_id).split('').reverse().join(''),
          permissions: ['application.revoke'],
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
      uuid: t.context.application.uuid,
    },
    {
      call: {
        user: {
          operator_id: t.context.operator_id,
          permissions: ['application.revoke'],
        },
      },
    },
  );
  t.is(result, null);
});

test.serial('#3.2 - Cannot revoke twice the same app', async (t) => {
  const result = await t.context.request(
    'application:revoke',
    { uuid: t.context.application.uuid },
    {
      call: {
        user: {
          operator_id: t.context.operator_id,
          permissions: ['application.revoke'],
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
          permissions: ['application.create'],
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
          permissions: ['application.create'],
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
          permissions: ['application.list'],
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
