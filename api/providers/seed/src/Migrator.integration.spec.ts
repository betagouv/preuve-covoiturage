import anyTest, { TestInterface } from 'ava';
import { Migrator } from './Migrator';

interface TestContext {
  db: Migrator;
}

const test = anyTest as TestInterface<TestContext>;

test.before(async (t) => {
  t.context.db = new Migrator(process.env.APP_POSTGRES_URL);
  await t.context.db.create();
  await t.context.db.up();
  await t.context.db.migrate();
  await t.context.db.seed();
});

test.after.always(async (t) => {
  await t.context.db.down();
  await t.context.db.drop();
});

test('should seed territories', async (t) => {
  const result = await t.context.db.connection.getClient().query({
    text: 'SELECT count(*) FROM territory.territories',
  });
  t.is(result.rows[0].count, '17');
});
