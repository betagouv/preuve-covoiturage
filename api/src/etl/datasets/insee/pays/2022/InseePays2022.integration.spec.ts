import { access } from "@/deps.ts";
import {
  afterAll,
  assert,
  assertEquals,
  assertRejects,
  beforeAll,
  describe,
  it,
} from "@/dev_deps.ts";
import { Migrator } from "../../../../Migrator.ts";
import { CreateGeoTable } from "../../../../datastructure/000_CreateGeoTable.ts";
import { CreateComEvolutionTable } from "../../../../datastructure/001_CreateComEvolutionTable.ts";
import { createFileManager, createPool } from "../../../../helpers/index.ts";
import { MemoryStateManager } from "../../../../providers/MemoryStateManager.ts";
import { InseePays2022 as Dataset } from "./InseePays2022.ts";

describe.skip("InseePays2022", () => {
  const connection = createPool();
  const migrator = new Migrator(connection, createFileManager(), {
    targetSchema: "public",
    datastructures: new Set([CreateGeoTable, CreateComEvolutionTable]),
    datasets: new Set([Dataset]),
    noCleanup: false,
  });
  const dataset = new Dataset(connection, createFileManager());

  beforeAll(async () => {
    await connection.query(`
      DROP TABLE IF EXISTS ${dataset.tableWithSchema}
    `);
    await connection.query(`
      DROP TABLE IF EXISTS public.dataset_migration
    `);
    await migrator.prepare();
  });

  afterAll(async () => {
    await connection.query(`
      DROP TABLE IF EXISTS ${dataset.tableWithSchema}
    `);
    await connection.query(`
      DROP TABLE IF EXISTS public.dataset_migration
    `);
  });

  it("should validate", async () => {
    await dataset.validate(new MemoryStateManager());
    assert(true);
  });

  it("should prepare", async () => {
    await dataset.before();
    const query = `SELECT * FROM ${dataset.tableWithSchema}`;
    console.debug(query);
    await connection.query(query);
    assert(true);
  });

  it("should download file", async () => {
    await dataset.download();
    assert(dataset.filepaths.length >= 1);
    for (const path of dataset.filepaths) {
      await access(path);
      assert(true);
    }
  });

  it("should transform", async () => {
    await dataset.transform();
    assert(true);
  });

  it("should load", async () => {
    await migrator.run([
      CreateGeoTable,
      CreateComEvolutionTable,
      Dataset,
    ]);
    const response = await connection.query(`
      SELECT count(distinct country) FROM public.perimeters
    `);
    assertEquals(response.rows[0].count, "208");
  });

  it("should cleanup", async () => {
    await dataset.after();
    const query = `SELECT * FROM ${dataset.tableWithSchema}`;
    await assertRejects(() => connection.query(query));
  });
});
