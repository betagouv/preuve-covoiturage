import anyTest, { TestInterface } from 'ava';
import { PostgresConnection } from '@ilos/connection-postgres';

import { ApplicationPgRepositoryProvider } from '../src/providers/ApplicationPgRepositoryProvider';

interface TestContext {
  connection: PostgresConnection;
  repository: ApplicationPgRepositoryProvider;
  uuid: string;
}

const test = anyTest.serial as TestInterface<TestContext>;

test.before(async (t) => {
  t.context.connection = new PostgresConnection({
    connectionString:
      'APP_POSTGRES_URL' in process.env
        ? process.env.APP_POSTGRES_URL
        : 'postgresql://postgres:postgres@localhost:5432/local',
  });

  await t.context.connection.up();

  t.context.repository = new ApplicationPgRepositoryProvider(t.context.connection);
});

test.after.always(async (t) => {
  if (t.context.uuid) {
    await t.context.connection.getClient().query({
      text: 'DELETE FROM application.applications WHERE uuid = $1',
      values: [t.context.uuid],
    });
  }

  await t.context.connection.down();
});

test.serial('should create an application', async (t) => {
  const result = await t.context.repository.create({
    name: 'Dummy Application',
    owner_id: 12345,
    owner_service: 'operator',
    permissions: ['journey.create', 'certificate.create', 'certificate.download'],
  });

  t.context.uuid = result.uuid;
  t.is(result.name, 'Dummy Application');
});

test.serial("should list owner's applications", async (t) => {
  const result = await t.context.repository.list({
    owner_id: 12345,
    owner_service: 'operator',
  });
  t.true(Array.isArray(result));

  t.is(result.filter((r) => r.uuid === t.context.uuid).length, 1);
});

test.serial('should find an application', async (t) => {
  const result = await t.context.repository.find({
    uuid: t.context.uuid,
    owner_id: 12345,
    owner_service: 'operator',
  });

  t.is(result.uuid, t.context.uuid);
});

test.serial('should revoke application by id', async (t) => {
  await t.context.repository.revoke({ uuid: t.context.uuid, owner_id: 12345, owner_service: 'operator' });
  const result = await t.context.connection.getClient().query({
    text: 'SELECT * FROM application.applications WHERE uuid = $1 LIMIT 1',
    values: [t.context.uuid],
  });

  t.is(result.rows[0].uuid, t.context.uuid);
  t.true(result.rows[0].deleted_at instanceof Date);
});
