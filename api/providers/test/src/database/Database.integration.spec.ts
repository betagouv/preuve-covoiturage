import anyTest, { TestInterface } from 'ava';
import { Database } from './Database';

interface TestContext {
  db: Database;
}

const test = anyTest as TestInterface<TestContext>;

test.before(async t => {
  t.context.db = new Database(process.env.APP_POSTGRES_URL, 'test');
  await t.context.db.create();
  await t.context.db.migrate();
  await t.context.db.seed();
});

test.after.always(async t => {
  await t.context.db.drop();
});

test('should work', async t => {
  t.pass();
});
