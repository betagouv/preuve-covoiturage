import anyTest, { TestFn } from 'ava';
import { Kernel as AbstractKernel } from '@ilos/framework';
import { kernel as kernelDecorator } from '@ilos/common';

import { ServiceProvider } from '../ServiceProvider';
import { OperatorPgRepositoryProvider } from './OperatorPgRepositoryProvider';
import { PostgresConnection } from '@ilos/connection-postgres';

interface TestContext {
  connection: PostgresConnection;
  repository: OperatorPgRepositoryProvider;
  _id: number;
}

const test = anyTest as TestFn<TestContext>;

test.before.skip(async (t) => {
  @kernelDecorator({
    children: [ServiceProvider],
  })
  class Kernel extends AbstractKernel {}

  t.context.connection = new PostgresConnection({
    connectionString:
      'APP_POSTGRES_URL' in process.env
        ? process.env.APP_POSTGRES_URL
        : 'postgresql://postgres:postgres@localhost:5432/local',
  });

  await t.context.connection.up();

  t.context.repository = new OperatorPgRepositoryProvider(t.context.connection, new Kernel());
});

test.after.always.skip(async (t) => {
  if (t.context._id) {
    await t.context.connection.getClient().query({
      text: 'DELETE FROM operator.operators WHERE _id = $1',
      values: [t.context._id],
    });
  }

  await t.context.connection.down();
});

test.serial.skip('should create an operator', async (t) => {
  const data = {
    name: 'Toto',
    legal_name: 'Toto inc.',
    siret: '1234567890123',
    contacts: {},
  };

  const result = await t.context.repository.create(data);
  t.context._id = result._id;
  t.is(result.name, data.name);
});

test.serial.skip('should update an operator', async (t) => {
  const data = {
    name: 'Tata',
  };

  const result = await t.context.repository.patch(t.context._id, data);
  t.is(result.name, data.name);
});

test.serial.skip('should list operators', async (t) => {
  const result = await t.context.repository.all();
  t.true(Array.isArray(result));
  const results = [...result.filter((r) => r._id === t.context._id)];
  t.is(results.length, 1);
  t.is(results[0]._id, t.context._id);
});

test.serial.skip('should find operator by id', async (t) => {
  const result = await t.context.repository.find(t.context._id);
  t.is(result._id, t.context._id);
});

test.serial.skip('should delete operator by id', async (t) => {
  await t.context.repository.delete(t.context._id);
  const result = await t.context.connection.getClient().query({
    text: 'SELECT * FROM operator.operators WHERE _id = $1 LIMIT 1',
    values: [t.context._id],
  });
  t.is(result.rows[0]._id, t.context._id);
  t.true(result.rows[0].deleted_at instanceof Date);

  const resultFromRepository = await t.context.repository.find(t.context._id);
  t.is(resultFromRepository, undefined);
});
