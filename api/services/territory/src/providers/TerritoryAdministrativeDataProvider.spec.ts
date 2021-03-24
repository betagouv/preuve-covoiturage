import anyTest, { TestInterface } from 'ava';
import { PostgresConnection } from '@ilos/connection-postgres';

import { Level, TerritoryAdministrativeDataProvider } from './TerritoryAdministrativeDataProvider';

interface TestContext {
  connection: PostgresConnection;
  provider: TerritoryAdministrativeDataProvider;
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
  t.context.provider = new TerritoryAdministrativeDataProvider(t.context.connection);
});

test.after.always(async (t) => {
  // await t.context.connection.getClient().query({
  //   text: `DELETE FROM ${t.context.repository.table} WHERE acquisition_id = $1`,
  //   values: [0],
  // });
  await t.context.connection.down();
});

test.skip('TerritoryAdministrativeDataProvider: should list regions', async t => {

});
