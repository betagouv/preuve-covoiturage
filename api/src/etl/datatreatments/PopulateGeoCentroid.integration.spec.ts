import { assert, assertEquals, beforeAll, describe, it } from "@/dev_deps.ts";
import { Migrator } from "../Migrator.ts";
import { CreateGeoTable } from "../datastructure/000_CreateGeoTable.ts";
import { CreateGeoCentroidTable } from "../datastructure/002_CreateGeoCentroidTable.ts";
import { createFileManager, createPool } from "../helpers/index.ts";
import { MemoryStateManager } from "../providers/MemoryStateManager.ts";
import { PopulateGeoCentroid as Dataset } from "./PopulateGeoCentroid.ts";

describe.skip("PopulateGeoCentroid", () => {
  const connection = createPool();
  const migrator = new Migrator(connection, createFileManager(), {
    targetSchema: "public",
    datastructures: new Set([CreateGeoTable, CreateGeoCentroidTable, Dataset]),
    datasets: new Set([]),
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

  it("should validate", async () => {
    await dataset.validate(new MemoryStateManager());
    assert(true);
  });

  it("should after", async () => {
    await migrator.run([
      CreateGeoTable,
      CreateGeoCentroidTable,
      Dataset,
    ]);
    const count = await connection.query(
      `SELECT count(*) FROM ${dataset.tableWithSchema}`,
    );
    assertEquals(count.rows[0].count, "0");
  });
});
