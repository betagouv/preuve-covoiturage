import anyTest, { TestFn } from 'ava';
import { httpMacro, HttpMacroContext } from '@pdc/helper-test';

import { bootstrap } from './bootstrap';
import { PostgresConnection } from '@ilos/connection-postgres/dist';
import { ServiceProvider } from './ServiceProvider';

const name = 'Toto';
const territoryGroupTable = 'territory.territory_group';
const territorySelectorTable = 'territory.territory_group_selector';

interface TestContext extends HttpMacroContext {
  operator_id: number;
}

function getDb(context: TestContext): PostgresConnection {
  return context.transport.getKernel().getContainer().get(ServiceProvider).getContainer().get(PostgresConnection);
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
  for (const text of [
    `DELETE FROM ${territorySelectorTable} WHERE territory_group_id IN 
      (SELECT _id FROM ${territoryGroupTable} WHERE name = $1)`,
    `DELETE FROM ${territoryGroupTable} WHERE name = $1`,
  ]) {
    await getDb(t.context)
      .getClient()
      .query({
        text,
        values: [name],
      });
  }
  const { transport, supertest, request } = t.context;
  await after({ transport, supertest, request });
});

test.serial('Create a territory', async (t) => {
  const response = await t.context.request(
    'territory:create',
    {
      name,
      shortname: 'toto',
      company_id: 1,
      contacts: {},
      address: {
        street: '1500 BD LEPIC',
        postcode: '73100',
        city: 'Aix Les Bains',
        country: 'France',
      },
      selector: {
        com: ['91477', '91471'],
      },
    },
    {
      call: {
        user: {
          permissions: ['registry.territory.create'],
        },
      },
    },
  );
  t.log(response);
  t.is(response.result.name, name);

  const dbResult = await getDb(t.context)
    .getClient()
    .query({
      text: `
     SELECT _id, name from ${territoryGroupTable} WHERE name = $1 
    `,
      values: [name],
    });

  t.true(dbResult.rowCount >= 1);
  t.is(dbResult.rows[0].name, name);
});

test.serial('Find a territory', async (t) => {
  const dbResult = await getDb(t.context)
    .getClient()
    .query({
      text: `
     SELECT _id, name from ${territoryGroupTable} WHERE name = $1 
    `,
      values: [name],
    });

  t.true(dbResult.rowCount >= 1);
  t.is(dbResult.rows[0].name, name);
  const _id = dbResult.rows[0]._id;

  const response = await t.context.request(
    'territory:find',
    { _id },
    {
      call: {
        user: {
          permissions: ['common.territory.find'],
        },
      },
    },
  );
  t.log(response);
  t.is(response.result.name, 'Toto');
});

test.serial('Update a territory', async (t) => {
  const dbResult = await getDb(t.context)
    .getClient()
    .query({
      text: `
     SELECT _id, name from ${territoryGroupTable} WHERE name = $1 
    `,
      values: [name],
    });

  t.true(dbResult.rowCount >= 1);
  t.is(dbResult.rows[0].name, name);
  const _id = dbResult.rows[0]._id;

  const initResponse = await t.context.request(
    'territory:find',
    { _id },
    {
      call: {
        user: {
          permissions: ['common.territory.find'],
        },
      },
    },
  );
  t.log(initResponse);
  t.is(initResponse.result.name, name);

  const updateData = {
    ...initResponse.result,
    selector: {
      com: ['91471', '91377'],
    },
  };
  t.log(updateData);
  const response = await t.context.request('territory:update', updateData, {
    call: {
      user: {
        permissions: ['registry.territory.update'],
      },
    },
  });

  t.log(response);
  t.is(response.result.selector.com.length, 2);

  const finalResponse = await t.context.request(
    'territory:find',
    { _id },
    {
      call: {
        user: {
          permissions: ['common.territory.find'],
        },
      },
    },
  );
  t.log(finalResponse);
  const { updated_at: u1, ...t1 } = finalResponse.result;
  const { updated_at: u2, ...t2 } = updateData;
  t.deepEqual(t1, t2);
});

test.serial('Patch contact on a territory', async (t) => {
  const dbResult = await getDb(t.context)
    .getClient()
    .query({
      text: `
     SELECT _id, name from ${territoryGroupTable} WHERE name = $1 
    `,
      values: [name],
    });
  t.true(dbResult.rowCount >= 1);
  t.is(dbResult.rows[0].name, name);
  const _id = dbResult.rows[0]._id;

  const response = await t.context.request(
    'territory:patchContacts',
    {
      _id: _id - 1,
      patch: {
        technical: {
          firstname: 'Nicolas',
        },
      },
    },
    {
      call: {
        user: {
          permissions: ['territory.territory.patchContacts'],
          territory_id: _id,
        },
      },
    },
  );
  t.log(response);
  t.is(response.result._id, _id);
  t.is(response.result.contacts.technical.firstname, 'Nicolas');
});

test.serial('Get authorized codes', async (t) => {
  const dbResult = await getDb(t.context)
    .getClient()
    .query({
      text: `
     SELECT _id, name from ${territoryGroupTable} WHERE name = $1 
    `,
      values: [name],
    });
  t.true(dbResult.rowCount >= 1);
  t.is(dbResult.rows[0].name, name);
  const _id = dbResult.rows[0]._id;

  await getDb(t.context)
    .getClient()
    .query({
      text: `
      INSERT INTO ${territorySelectorTable}
      (territory_group_id, selector_type, selector_value) VALUES
      ($1, $2, $3)
      `,
      values: [_id, 'com', '91477'],
    });

  const response = await t.context.request(
    'territory:getAuthorizedCodes',
    {
      _id,
    },
    {
      call: {
        user: {
          permissions: ['common.territory.read'],
        },
      },
    },
  );
  t.log(response);
  t.true(Array.isArray(response.result.com));
  t.true(response.result.com.length === 3);
  t.deepEqual(response.result.com.sort(), ['91377', '91471', '91477']);
});

test.serial('Lists all territories', async (t) => {
  const response = await t.context.request(
    'territory:list',
    {
      search: name,
    },
    {
      call: {
        user: {
          permissions: ['common.territory.list'],
        },
      },
    },
  );
  t.log(response);
  t.true('data' in response.result);
  t.true(Array.isArray(response.result.data));
  t.log(response.result.data);
  const territory = response.result.data.filter((r) => r.name === name);
  t.is(territory.length, 1);
});

test.serial('Lists all geo zones', async (t) => {
  const response = await t.context.request(
    'territory:listGeo',
    {
      search: 'Massy',
    },
    {
      call: {
        user: {
          permissions: ['common.territory.list'],
        },
      },
    },
  );
  t.log(response.result.data);
  t.log(response.result.meta.pagination);
  t.true('data' in response.result);
  t.true(Array.isArray(response.result.data));
  t.is(response.result.data.length, 1);
  t.is(response.result.meta.pagination.total, 1);
  t.is(response.result.meta.pagination.offset, 0);
  t.is(response.result.meta.pagination.limit, 100);
});
