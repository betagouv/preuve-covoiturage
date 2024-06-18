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
import { createFileManager, createPool } from "../../../../helpers/index.ts";
import { MemoryStateManager } from "../../../../providers/MemoryStateManager.ts";
import { InseePerim2020 as Dataset } from "./InseePerim2020.ts";

describe.skip("InseePerim2020", () => {
  const connection = createPool();
  const dataset = new Dataset(connection, createFileManager());

  beforeAll(async () => {
    await connection.query(`
      DROP TABLE IF EXISTS ${dataset.tableWithSchema}
    `);
  });

  afterAll(async () => {
    await connection.query(`
      DROP TABLE IF EXISTS ${dataset.tableWithSchema}
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
    await dataset.load();
    const first = await connection.query(`
    SELECT * FROM ${dataset.tableWithSchema} order by codgeo asc limit 1
  `);
    assertEquals(first.rows[0].dep, "01");
    assertEquals(first.rows[0].epci, "200069193");
    const last = await connection.query(`
    SELECT * FROM ${dataset.tableWithSchema} order by codgeo desc limit 1
  `);
    assertEquals(last.rows[0].dep, "976");
    assertEquals(last.rows[0].epci, "200059871");
    const count = await connection.query(`
    SELECT count(*) FROM ${dataset.tableWithSchema}
  `);
    assertEquals(count.rows[0].count, "34968");
  });

  it("should cleanup", async () => {
    await dataset.after();
    const query = `SELECT * FROM ${dataset.tableWithSchema}`;
    await assertRejects(() => connection.query(query));
  });
});
