import anyTest from 'ava';
import { httpMacro } from '@pdc/helper-test';

import { bootstrap } from './bootstrap';
import { PostgresConnection } from '@ilos/connection-postgres/dist';
import { ServiceProvider } from './ServiceProvider';

const name = 'Toto';
function getDb(context: any): PostgresConnection {
  return context.transport.getKernel().getContainer().get(ServiceProvider).getContainer().get(PostgresConnection);
}
const { test } = httpMacro(anyTest, () => bootstrap.boot('http', 0));

test.after.always(async (t) => {
  await getDb(t.context)
    .getClient()
    .query({
      text: `
     DELETE FROM territory.territories WHERE name = $1 
    `,
      values: [name],
    });
});

test.serial('Create a territory', async (t) => {
  const response = await t.context.request(
    'territory:create',
    {
      name: name,
      level: 'towngroup',
      active: false,
      activable: false,
      insee: ['91377'],
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
     SELECT _id, name from territory.territories WHERE name = $1 
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
     SELECT _id, name from territory.territories WHERE name = $1 
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
     SELECT _id, name, level, active, activable from territory.territories WHERE name = $1 
    `,
      values: [name],
    });
  t.true(dbResult.rowCount >= 1);
  t.is(dbResult.rows[0].name, name);

  const response = await t.context.request(
    'territory:update',
    {
      ...dbResult.rows[0],
      insee: ['91377'],
      shortname: 'Yop',
    },
    {
      call: {
        user: {
          permissions: ['registry.territory.update'],
        },
      },
    },
  );
  t.log(response);
  t.is(response.result.shortname, 'Yop');
});

test.serial('Patch contact on a territory', async (t) => {
  const dbResult = await getDb(t.context)
    .getClient()
    .query({
      text: `
     SELECT _id, name from territory.territories WHERE name = $1 
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
     SELECT _id, name from territory.territories WHERE name = $1 
    `,
      values: [name],
    });
  t.true(dbResult.rowCount >= 1);
  t.is(dbResult.rows[0].name, name);
  const _id = dbResult.rows[0]._id;

  await getDb(t.context)
    .getClient()
    .query({
      text: `INSERT INTO territory.territory_relation (parent_territory_id, child_territory_id) VALUES ($1, $2)`,
      values: [_id, 1],
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
  t.true(Array.isArray(response.result._id));
  t.true(response.result._id.length >= 1);
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
  t.log(response);
  t.log(response.result.meta.pagination);
  t.true('data' in response.result);
  t.true(Array.isArray(response.result.data));
  t.is(response.result.data.length, 1);
  t.is(response.result.meta.pagination.total, 1);
  t.is(response.result.meta.pagination.offset, 0);
  t.is(response.result.meta.pagination.limit, 100);
});

test.serial('Find geo zone by code', async (t) => {
  const response = await t.context.request(
    'territory:findGeoByCode',
    {
      insees: ['91377'],
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
  t.true(Array.isArray(response.result));
  t.true(response.result.length >= 2);
  t.is(response.result.filter((r) => r.name === name).length, 1);
});
