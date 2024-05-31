import anyTest, { TestFn } from 'ava';
import { ConfigInterfaceResolver } from '@ilos/common/index.ts';
import { PostgresConnection } from '@ilos/connection-postgres/index.ts';

import { UserPgRepositoryProvider } from './UserPgRepositoryProvider.ts';
import { UserCreateInterface } from '@shared/user/common/interfaces/UserCreateInterface.ts';

interface TestContext {
  connection: PostgresConnection;
  repository: UserPgRepositoryProvider;
  territory_id: number;
  operator_id: number;
  registry_id: number;
}

const test = anyTest as TestFn<TestContext>;

test.before.skip(async (t) => {
  class Config extends ConfigInterfaceResolver {
    get<T>(_k: string, fb: T): T {
      return fb;
    }
  }

  t.context.connection = new PostgresConnection({
    connectionString:
      'APP_POSTGRES_URL' in process.env
        ? process.env.APP_POSTGRES_URL
        : 'postgresql://postgres:postgres@localhost:5432/local',
  });

  await t.context.connection.up();

  t.context.repository = new UserPgRepositoryProvider(t.context.connection, new Config());
});

test.after.always.skip(async (t) => {
  const ids = [];
  for (const id_type of ['territory_id', 'operator_id', 'registry_id']) {
    if (t.context[id_type]) {
      ids.push(t.context[id_type]);
    }
  }

  if (ids.length) {
    await t.context.connection.getClient().query({
      text: `DELETE FROM ${t.context.repository.table} WHERE _id = ANY($1::int[])`,
      values: [ids],
    });
  }

  await t.context.connection.down();
});

function isSame(keysType: 'list' | 'find', input: (string | number | symbol)[]): boolean {
  const keys = {
    list: [
      'group',
      '_id',
      'status',
      'created_at',
      'updated_at',
      'email',
      'firstname',
      'lastname',
      'role',
      'phone',
      'operator_id',
      'territory_id',
    ],
    find: ['ui_status', 'permissions'],
  };

  const compare = keysType === 'list' ? keys.list : [...keys.list, ...keys.find];
  const setCompare = new Set(compare);
  const setInput = new Set(input);
  const setBoth = new Set([...compare, ...input]);
  return setCompare.size === setInput.size && setCompare.size === setBoth.size;
}

function hasFindKeys(input: { [k: string]: any }): boolean {
  return isSame('find', Reflect.ownKeys(input));
}

function hasListKeys(input: { [k: string]: any }): boolean {
  return isSame('list', Reflect.ownKeys(input));
}
test.serial.skip('should create a user', async (t) => {
  const territoryInput: UserCreateInterface = {
    email: 'territory@toto.com',
    firstname: 'toto',
    lastname: 'tata',
    role: 'territory.admin',
    phone: '0102030405',
    territory_id: 1,
  };

  const operatorInput: UserCreateInterface = {
    email: 'operator@toto.com',
    firstname: 'toto',
    lastname: 'tata',
    role: 'operator.admin',
    phone: '0102030405',
    operator_id: 1,
  };

  const registryInput: UserCreateInterface = {
    email: 'registry@toto.com',
    firstname: 'toto',
    lastname: 'tata',
    role: 'registry.admin',
    phone: '0102030405',
  };
  const territoryData = await t.context.repository.create(territoryInput);
  t.context.territory_id = territoryData._id;
  t.is(territoryData.email, territoryInput.email);
  t.true(hasFindKeys(territoryData));

  const operatorData = await t.context.repository.create(operatorInput);
  t.context.operator_id = operatorData._id;
  t.is(operatorData.email, operatorInput.email);
  t.true(hasFindKeys(operatorData));

  const registryData = await t.context.repository.create(registryInput);
  t.context.registry_id = registryData._id;
  t.is(registryData.email, registryInput.email);
  t.true(hasFindKeys(registryData));
});

test.serial.skip('should patch a user', async (t) => {
  const data = {
    phone: '0203040506',
  };
  const result = await t.context.repository.patch(t.context.operator_id, data);
  t.is(result.phone, data.phone);
  t.true(hasFindKeys(result));
});

test.serial.skip('should patch the user if group matches', async (t) => {
  const data = {
    phone: '0304050607',
  };

  const result = await t.context.repository.patchByTerritory(t.context.territory_id, data, 1);
  t.is(result.phone, data.phone);
  t.true(hasFindKeys(result));
});

test.serial.skip('should not patch the user if group does not match', async (t) => {
  const data = {
    phone: '0203040506',
  };

  const result = await t.context.repository.patchByOperator(t.context.operator_id, data, 111);
  t.is(result, undefined);
});

test.serial.skip('should list users', async (t) => {
  const result = await t.context.repository.list({}, { offset: 0, limit: 1000 });
  t.true('users' in result);
  t.true(Array.isArray(result.users));

  // weird behaviour. Not all users are listed by the .list() command
  const insertedUsers = result.users.filter((u) => /@toto.com$/.test(u.email));
  for (const r of insertedUsers) {
    t.true(hasListKeys(r));
  }
});

test.serial.skip('should list users with pagination', async (t) => {
  const result = await t.context.repository.list({}, { limit: 1, offset: 1 });
  t.true('users' in result);
  t.true(Array.isArray(result.users));
  t.is(result.users.length, 1);
  for (const r of result.users) {
    t.true(hasListKeys(r));
  }
});

test.serial.skip('should list users with filters', async (t) => {
  const result = await t.context.repository.list({ operator_id: 1 }, { limit: 10, offset: 0 });
  t.true('total' in result);
  t.is(result.total, 1);
  t.true('users' in result);
  t.true(Array.isArray(result.users));
  t.is(result.users.length, 1);
  for (const r of result.users) {
    t.true(hasListKeys(r));
  }
});

test.serial.skip('should find user by id', async (t) => {
  const result = await t.context.repository.find(t.context.registry_id);
  t.is(result._id, t.context.registry_id);
  t.true(hasFindKeys(result));
});

test.serial.skip('should find user by id if group match', async (t) => {
  const result = await t.context.repository.findByOperator(t.context.operator_id, 1);
  t.is(result._id, t.context.operator_id);
  t.true(hasFindKeys(result));
});

test.serial.skip('should not find user by id if group dont match', async (t) => {
  const result = await t.context.repository.findByTerritory(t.context.territory_id, 111);
  t.is(result, undefined);
});

test.serial.skip('should delete user by id', async (t) => {
  await t.context.repository.delete(t.context.registry_id);
  const result = await t.context.connection.getClient().query({
    text: `SELECT * FROM ${t.context.repository.table} WHERE _id = $1 LIMIT 1`,
    values: [t.context.registry_id],
  });
  t.is(result.rowCount, 0);

  const resultFromRepository = await t.context.repository.find(t.context.registry_id);
  t.is(resultFromRepository, undefined);
});

test.serial.skip('should delete user by id if group match', async (t) => {
  await t.context.repository.deleteByTerritory(t.context.territory_id, 1);
  const result = await t.context.connection.getClient().query({
    text: `SELECT * FROM ${t.context.repository.table} WHERE _id = $1 LIMIT 1`,
    values: [t.context.territory_id],
  });
  t.is(result.rowCount, 0);

  const resultFromRepository = await t.context.repository.find(t.context.territory_id);
  t.is(resultFromRepository, undefined);
});

test.serial.skip('should not delete user by id if group dont match', async (t) => {
  await t.context.repository.deleteByOperator(t.context.operator_id, 111);
  const result = await t.context.connection.getClient().query({
    text: `SELECT * FROM ${t.context.repository.table} WHERE _id = $1 LIMIT 1`,
    values: [t.context.operator_id],
  });
  t.is(result.rows[0]._id, t.context.operator_id);

  const resultFromRepository = await t.context.repository.find(t.context.operator_id);
  t.not(resultFromRepository, undefined);
});
