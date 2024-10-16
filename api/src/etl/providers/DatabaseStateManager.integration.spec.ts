import {
  afterAll,
  assert,
  assertEquals,
  beforeAll,
  describe,
  it,
} from "@/dev_deps.ts";
import { createPool } from "../helpers/index.ts";
import { StaticMigrable } from "../interfaces/index.ts";
import { DatabaseStateManager as StateManager } from "./DatabaseStateManager.ts";

describe.skip("DatabaseStateManager", () => {
  const FakeMigrable = { uuid: "key", year: 2022 } as unknown as StaticMigrable;
  const connection = createPool();
  const migrator = new StateManager(connection, {
    targetSchema: "public",
    datastructures: new Set([FakeMigrable]),
    datasets: new Set([]),
    noCleanup: false,
  });

  beforeAll(async () => {
    await connection.query(`
      DROP TABLE IF EXISTS ${migrator.table}
    `);
  });

  afterAll(async () => {
    await connection.query(`
      DROP TABLE IF EXISTS ${migrator.table}
    `);
  });

  it("should install", async () => {
    await migrator.install();
    const query = `SELECT * FROM ${migrator.table}`;
    console.debug(query);
    await connection.query(query);
    assert(true);
  });

  it("should set key", async () => {
    const state = await migrator.toMemory();
    state.set(FakeMigrable);
    await migrator.fromMemory(state);
    const query = `SELECT key FROM ${migrator.table}`;
    console.debug(query);
    const result = await connection.query(query);
    assertEquals(result.rows, [{ key: "key" }]);
  });

  it("should do nothing if conflict", async () => {
    const state = await migrator.toMemory();
    state.set(FakeMigrable);
    await migrator.fromMemory(state);
    const query = `SELECT key FROM ${migrator.table}`;
    console.debug(query);
    const result = await connection.query(query);
    assertEquals(result.rows, [{ key: "key" }]);
  });

  it("should get keys", async () => {
    const state = await migrator.toMemory();
    const result = state.get();
    assertEquals(result, new Set([FakeMigrable]));
  });
});
