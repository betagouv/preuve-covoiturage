import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { Migrator } from './Migrator.ts';

interface TestContext {
  db: Migrator;
}

const test = anyTest as TestFn<TestContext>;

beforeAll(async (t) => {
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

it('should seed territories', async (t) => {
  const result = await t.context.db.connection.getClient().query({
    text: 'SELECT count(*) FROM geo.perimeters',
  });
  assertEquals(result.rows[0].count, '17');
});
