import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { PostgresConnection } from '@/ilos/connection-postgres/index.ts';
import { ConfigInterfaceResolver } from '@/ilos/common/index.ts';

import { ApplicationPgRepositoryProvider } from './ApplicationPgRepositoryProvider.ts';

interface TestContext {
  connection: PostgresConnection;
  repository: ApplicationPgRepositoryProvider;
  uuid: string;
}

class Config extends ConfigInterfaceResolver {}

const test = anyTest as TestFn<TestContext>;

test.before.skip(async (t) => {
  t.context.connection = new PostgresConnection({
    connectionString:
      'APP_POSTGRES_URL' in process.env
        ? process.env.APP_POSTGRES_URL
        : 'postgresql://postgres:postgres@localhost:5432/local',
  });

  await t.context.connection.up();

  t.context.repository = new ApplicationPgRepositoryProvider(t.context.connection, new Config());
});

test.after.always.skip(async (t) => {
  if (t.context.uuid) {
    await t.context.connection.getClient().query({
      text: 'DELETE FROM application.applications WHERE uuid = $1',
      values: [t.context.uuid],
    });
  }

  await t.context.connection.down();
});

test.serial.skip('should create an application', async (t) => {
  const result = await t.context.repository.create({
    name: 'Dummy Application',
    owner_id: 12345,
    owner_service: 'operator',
    permissions: ['journey.create', 'certificate.create', 'certificate.download'],
  });

  t.context.uuid = result.uuid;
  assertEquals(result.name, 'Dummy Application');
});

test.serial.skip("should list owner's applications", async (t) => {
  const result = await t.context.repository.list({
    owner_id: 12345,
    owner_service: 'operator',
  });
  assert(Array.isArray(result));

  assertEquals(result.filter((r) => r.uuid === t.context.uuid).length, 1);
});

test.serial.skip('should find an application', async (t) => {
  const result = await t.context.repository.find({
    uuid: t.context.uuid,
    owner_id: 12345,
    owner_service: 'operator',
  });

  assertEquals(result.uuid, t.context.uuid);
});

test.serial.skip('should revoke application by id', async (t) => {
  await t.context.repository.revoke({ uuid: t.context.uuid, owner_id: 12345, owner_service: 'operator' });
  const result = await t.context.connection.getClient().query({
    text: 'SELECT * FROM application.applications WHERE uuid = $1 LIMIT 1',
    values: [t.context.uuid],
  });

  assertEquals(result.rows[0].uuid, t.context.uuid);
  assert(result.rows[0].deleted_at instanceof Date);
});
