import anyTest, { TestInterface } from 'ava';
import { PostgresConnection } from '@ilos/connection-postgres';

import { TripRepositoryProvider } from './TripRepositoryProvider';
import { ProcessableCampaign } from '../engine/ProcessableCampaign';

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
        : 'postgresql://postgres:postgres@localhost:5432/local',
  });
  await t.context.connection.up();
  t.context.repository = new TripRepositoryProvider(t.context.connection);
});

test.after.always(async (t) => {
  await t.context.connection.down();
});

test('Should work', async (t) => {
  const i = await t.context.repository.findTripByPolicy(
    new ProcessableCampaign({
      territory_id: 310,
      name: 'name',
      description: 'description',
      start_date: new Date('2019-07-15'),
      end_date: new Date(),
      unit: 'euros',
      status: 'dontcare',
      global_rules: [],
      rules: [],
    }),
  );
  // need fixture to test this behavior
  // t.log(await i.next());
  // t.log(await i.next());
  // t.fail();
});
