import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { access } from '@/deps.ts';
import { Pool } from '@/deps.ts';
import { MemoryStateManager } from '../../../../providers/MemoryStateManager.ts';
import { AbstractDataset } from '../../../../common/AbstractDataset.ts';
import { createPool, createFileManager } from '../../../../helpers/index.ts';
import { DgclBanatic2021 as Dataset } from './DgclBanatic2021.ts';

interface TestContext {
  connection: Pool;
  dataset: AbstractDataset;
}

const test = anyTest as TestFn<TestContext>;

beforeAll(async (t) => {
  t.context.connection = createPool();
  t.context.dataset = new Dataset(t.context.connection, createFileManager());
  await t.context.connection.query(`
      DROP TABLE IF EXISTS ${t.context.dataset.tableWithSchema}
    `);
});

test.after.always(async (t) => {
  await t.context.connection.query(`
      DROP TABLE IF EXISTS ${t.context.dataset.tableWithSchema}
    `);
});

it('should validate', async (t) => {
  await t.notThrowsAsync(() => t.context.dataset.validate(new MemoryStateManager()));
});

it('should prepare', async (t) => {
  await t.context.dataset.before();
  const query = `SELECT * FROM ${t.context.dataset.tableWithSchema}`;
  t.log(query);
  await t.notThrowsAsync(() => t.context.connection.query(query));
});

it('should download file', async (t) => {
  await t.context.dataset.download();
  assert(t.context.dataset.filepaths.length >= 1);
  for (const path of t.context.dataset.filepaths) {
    await t.notThrowsAsync(() => access(path));
  }
});

it('should transform', async (t) => {
  await t.notThrowsAsync(() => t.context.dataset.transform());
});

it('should load', async (t) => {
  await t.context.dataset.load();
  const response = await t.context.connection.query(`
      SELECT count(*) FROM ${t.context.dataset.tableWithSchema}
    `);
  assertEquals(response.rows[0].count, '10137');
});

test.serial.skip('should cleanup', async (t) => {
  await t.context.dataset.after();
  const query = `SELECT * FROM ${t.context.dataset.tableWithSchema}`;
  await assertThrows(() => t.context.connection.query(query));
});
