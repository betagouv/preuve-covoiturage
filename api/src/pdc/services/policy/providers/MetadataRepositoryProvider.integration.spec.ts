import { afterAll, assertEquals, beforeAll, describe, it } from "@/dev_deps.ts";
import { DbContext, makeDbBeforeAfter } from "@/pdc/providers/test/index.ts";

import { MetadataRepositoryProvider } from "./MetadataRepositoryProvider.ts";

describe("MetadataRepositoryProvider", () => {
  let db: DbContext;
  let repository: MetadataRepositoryProvider;

  const { before, after } = makeDbBeforeAfter();

  beforeAll(async () => {
    db = await before();
    repository = new MetadataRepositoryProvider(
      db.connection,
    );
  });

  afterAll(async () => {
    await after(db);
  });

  it("Should save meta", async () => {
    const data = [
      {
        policy_id: 1,
        key: "my_key",
        value: 0,
        datetime: new Date("2021-01-01"),
      },
      {
        policy_id: 1,
        key: "my_key_2",
        value: 500,
        datetime: new Date("2021-02-01"),
      },
      {
        policy_id: 1,
        key: "my_key",
        value: 100,
        datetime: new Date("2021-03-01"),
      },
      {
        policy_id: 1,
        key: "my_key",
        value: 200,
        datetime: new Date("2021-04-01"),
      },
    ];
    await repository.set(data);
    const result = await db.connection.getClient().query({
      text: `
      SELECT policy_id, key, value, datetime
      FROM ${repository.table}
      WHERE policy_id = $1 ORDER BY datetime
    `,
      values: [1],
    });
    assertEquals(result.rows, data);
  });

  it("Should read meta", async () => {
    const result = await repository.get(1, ["my_key", "my_key_2"]);
    assertEquals(result, [
      {
        policy_id: 1,
        key: "my_key",
        value: 200,
        datetime: new Date("2021-04-01"),
      },
      {
        policy_id: 1,
        key: "my_key_2",
        value: 500,
        datetime: new Date("2021-02-01"),
      },
    ]);
  });

  it("Should read meta in past", async () => {
    const result = await repository.get(
      1,
      ["my_key", "my_key_2"],
      new Date("2021-03-01"),
    );
    assertEquals(result, [
      {
        policy_id: 1,
        key: "my_key",
        value: 100,
        datetime: new Date("2021-03-01"),
      },
      {
        policy_id: 1,
        key: "my_key_2",
        value: 500,
        datetime: new Date("2021-02-01"),
      },
    ]);
  });

  it("Should not throw if key not found", async () => {
    const result = await repository.get(1, [
      "my_key",
      "my_key_2",
      "unknown_key",
    ], new Date("2021-01-01"));
    assertEquals(result, [
      {
        policy_id: 1,
        key: "my_key",
        value: 0,
        datetime: new Date("2021-01-01"),
      },
    ]);
  });

  it("Should delete meta", async () => {
    const data = [
      {
        policy_id: 1,
        key: "my_key",
        value: 0,
        datetime: new Date("2021-01-01"),
      },
      {
        policy_id: 1,
        key: "my_key_2",
        value: 500,
        datetime: new Date("2021-02-01"),
      },
    ];
    await repository.delete(1, new Date("2021-03-01"));
    const result = await db.connection.getClient().query({
      text: `
      SELECT policy_id, key, value, datetime
      FROM ${repository.table}
      WHERE policy_id = $1 ORDER BY datetime
    `,
      values: [1],
    });
    assertEquals(result.rows, data);
  });
});
