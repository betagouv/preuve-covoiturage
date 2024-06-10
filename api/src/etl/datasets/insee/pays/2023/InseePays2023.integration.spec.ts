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
import { access } from "@/deps.ts";
import { Pool } from "@/deps.ts";
import { MemoryStateManager } from "../../../../providers/MemoryStateManager.ts";
import { AbstractDataset } from "../../../../common/AbstractDataset.ts";
import { createFileManager, createPool } from "../../../../helpers/index.ts";
import { InseePays2023 as Dataset } from "./InseePays2023.ts";
import { Migrator } from "../../../../Migrator.ts";
import { CreateGeoTable } from "../../../../datastructure/000_CreateGeoTable.ts";
import { CreateComEvolutionTable } from "../../../../datastructure/001_CreateComEvolutionTable.ts";

interface TestContext {
  migrator: Migrator;
  connection: Pool;
  dataset: AbstractDataset;
}

const test = anyTest as TestFn<TestContext>;

beforeAll(async (t) => {
  t.context.connection = createPool();
  t.context.migrator = new Migrator(t.context.connection, createFileManager(), {
    targetSchema: "public",
    datastructures: new Set([CreateGeoTable, CreateComEvolutionTable]),
    datasets: new Set([Dataset]),
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

test.after.always(async (t) => {
  await t.context.connection.query(`
      DROP TABLE IF EXISTS ${t.context.dataset.tableWithSchema}
    `);
  await t.context.connection.query(`
      DROP TABLE IF EXISTS public.dataset_migration
    `);
});

it("should validate", async (t) => {
  await t.notThrowsAsync(() =>
    t.context.dataset.validate(new MemoryStateManager())
  );
});

it("should prepare", async (t) => {
  await t.context.dataset.before();
  const query = `SELECT * FROM ${t.context.dataset.tableWithSchema}`;
  t.log(query);
  await t.notThrowsAsync(() => t.context.connection.query(query));
});

it("should download file", async (t) => {
  await t.context.dataset.download();
  assert(t.context.dataset.filepaths.length >= 1);
  for (const path of t.context.dataset.filepaths) {
    await t.notThrowsAsync(() => access(path));
  }
});

it("should transform", async (t) => {
  await t.notThrowsAsync(() => t.context.dataset.transform());
});

it("should load", async (t) => {
  await t.context.migrator.run([
    CreateGeoTable,
    CreateComEvolutionTable,
    Dataset,
  ]);
  const response = await t.context.connection.query(`
      SELECT count(distinct country) FROM public.perimeters
    `);
  assertEquals(response.rows[0].count, "208");
});

it("should cleanup", async (t) => {
  await t.context.dataset.after();
  const query = `SELECT * FROM ${t.context.dataset.tableWithSchema}`;
  await assertThrows(() => t.context.connection.query(query));
});
