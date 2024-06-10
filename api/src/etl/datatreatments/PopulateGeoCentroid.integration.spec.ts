import {
  afterAll,
  afterEach,
  assert,
  assertEquals,
  assertFalse,
  assertObjectMatch,
  assertThrows,
  beforeAll,
  beforeEach,
  describe,
  it,
} from "@/dev_deps.ts";
import { Pool } from "@/deps.ts";
import { MemoryStateManager } from "../providers/MemoryStateManager.ts";
import { AbstractDatatreatment } from "../common/AbstractDatatreatment.ts";
import { createFileManager, createPool } from "../helpers/index.ts";
import { PopulateGeoCentroid as Dataset } from "./PopulateGeoCentroid.ts";
import { Migrator } from "../Migrator.ts";
import { CreateGeoTable } from "../datastructure/000_CreateGeoTable.ts";
import { CreateGeoCentroidTable } from "../datastructure/002_CreateGeoCentroidTable.ts";

interface TestContext {
  migrator: Migrator;
  connection: Pool;
  dataset: AbstractDatatreatment;
}

const test = anyTest as TestFn<TestContext>;

beforeAll(async (t) => {
  t.context.connection = createPool();
  t.context.migrator = new Migrator(t.context.connection, createFileManager(), {
    targetSchema: "public",
    datastructures: new Set([CreateGeoTable, CreateGeoCentroidTable, Dataset]),
    datasets: new Set([]),
    noCleanup: false,
  });
  t.context.dataset = new Dataset(t.context.connection, createFileManager());
  await t.context.connection.query(`
      DROP TABLE IF EXISTS ${t.context.dataset.tableWithSchema}
    `);
  await t.context.connection.query(`
      DROP TABLE IF EXISTS public.dataset_migration
    `);
  await t.context.migrator.prepare();
});

it("should validate", async (t) => {
  await t.notThrowsAsync(() =>
    t.context.dataset.validate(new MemoryStateManager())
  );
});

it("should after", async (t) => {
  await t.context.migrator.run([
    CreateGeoTable,
    CreateGeoCentroidTable,
    Dataset,
  ]);
  const count = await t.context.connection.query(
    `SELECT count(*) FROM ${t.context.dataset.tableWithSchema}`,
  );
  assertEquals(count.rows[0].count, "0");
});
