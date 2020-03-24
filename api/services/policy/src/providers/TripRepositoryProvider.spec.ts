import anyTest, { TestInterface } from 'ava';
import { PostgresConnection } from '@ilos/connection-postgres';

import { TripRepositoryProvider } from './TripRepositoryProvider';

interface TestContext {
  connection: PostgresConnection;
  repository: TripRepositoryProvider;
}

const test = anyTest as TestInterface<TestContext>;

test.before(async (t) => {
  t.context.connection = new PostgresConnection({
    connectionString:
      'APP_POSTGRES_URL' in process.env
        ? process.env.APP_POSTGRES_URL
        : 'postgresql://postgres:postgres@localhost:5432/pdc-local',
  });
  await t.context.connection.up();
  t.context.repository = new TripRepositoryProvider(t.context.connection);
});

test.after.always(async(t) => {
  await t.context.connection.down();
});

test('Should work', async (t) => {
  const i = await t.context.repository.findTripByPolicy(3);
  // need fixture to test this behavior
  // t.log(await i.next());
  // t.log(await i.next());
  t.pass();
});