import anyTest, { TestInterface } from 'ava';
import { PostgresConnection } from '@ilos/connection-postgres';

import { TerritoryOperatorRepositoryProvider } from './TerritoryOperatorRepositoryProvider';

interface TestContext {
  connection: PostgresConnection;
  repository: TerritoryOperatorRepositoryProvider;
  territoryIds: number[];
  operatorId: number;
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

  t.context.repository = new TerritoryOperatorRepositoryProvider(t.context.connection);
  t.context.territoryIds = [2, 3];
  t.context.operatorId = 666;
});

test.after.always(async (t) => {
  await t.context.connection.getClient().query({
    text: 'DELETE FROM territory.territory_operators WHERE operator_id = $1',
    values: [t.context.operatorId],
  });

  await t.context.connection.down();
});

test.serial('should update by operator', async (t) => {
  const result = await t.context.repository.updateByOperator(t.context.operatorId, t.context.territoryIds);
  t.is(result, undefined);
});

test.serial('should list by operator', async (t) => {
  const resultFromRepository = await t.context.repository.findByOperator(t.context.operatorId);
  t.true(Array.isArray(resultFromRepository));
  for (const territoryId of t.context.territoryIds) {
    t.true(resultFromRepository.indexOf(territoryId) > -1);
  }
});

test.serial('should list by territory', async (t) => {
  const resultFromRepository = await t.context.repository.findByTerritory(t.context.territoryIds[0]);
  t.true(Array.isArray(resultFromRepository));
  t.true(resultFromRepository.indexOf(t.context.operatorId) > -1);
});
