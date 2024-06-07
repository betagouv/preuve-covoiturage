import { process } from "@/deps.ts";
import { afterAll, assertEquals, beforeAll, describe, it } from "@/dev_deps.ts";
import { RedisConnection } from "./RedisConnection.ts";

describe("RedisConnection", () => {
  const connection = new RedisConnection(
    process.env.APP_REDIS_URL ?? "redis://127.0.0.1:6379",
  );

  beforeAll(async () => {
    await connection.up();
  });

  afterAll(async () => {
    await connection.down();
  });

  it("works", async () => {
    let assertions = 0;
    const client = connection.getClient();
    client.on("ready", () => {
      ++assertions;
    });
    await connection.up();
    ++assertions;
    assertEquals(assertions, 2);
  });
});
