import { process } from "@/deps.ts";
import { afterAll, assertEquals, beforeAll, describe, it } from "@/dev_deps.ts";
import { RedisConnection } from "./RedisConnection.ts";

describe("RedisConnection", () => {
  let connection: RedisConnection | null = null;
  let timeout: number | null = null;

  beforeAll(() => {
    // lazyConnect is disabled and creating a new RedisConnection instance
    // connects automatically to the Redis server.
    connection = new RedisConnection(
      process.env.APP_REDIS_URL ?? "redis://127.0.0.1:6379",
    );
  });

  afterAll(async () => {
    timeout && clearTimeout(timeout);
    await connection?.down();
  });

  it("works", async () => {
    const res = await (new Promise((resolve, reject) => {
      const client = connection?.getClient();
      if (!client) return reject("no client");
      client.on("ready", () => {
        resolve("ready");
      });

      // escape on connection failure
      timeout = setTimeout(() => {
        reject("timeout");
      }, 1000);
    }));

    assertEquals(res, "ready");
  });
});
