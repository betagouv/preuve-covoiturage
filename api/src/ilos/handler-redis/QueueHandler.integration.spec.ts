import {
  afterAll,
  assert,
  assertObjectMatch,
  beforeAll,
  beforeEach,
  describe,
  it,
} from "@/dev_deps.ts";
import { ContextType } from "@/ilos/common/index.ts";
import { RedisConnection } from "@/ilos/connection-redis/index.ts";
import process from "node:process";
import { QueueHandler } from "./QueueHandler.ts";
import { queueHandlerFactory } from "./helpers/queueHandlerFactory.ts";

describe("QueueHandler", () => {
  let handler: QueueHandler | null = null;
  const context: ContextType = {
    channel: {
      service: "",
    },
  };
  const connection = new RedisConnection(
    process.env.APP_REDIS_URL ?? "redis://127.0.0.1:6379",
    {
      lazyConnect: true,
    },
  );

  beforeAll(async () => {
    await connection.up();
  });

  afterAll(async () => {
    await connection.down();
  });

  beforeEach(async () => {
    handler = new (queueHandlerFactory("basic", "0.0.1"))(connection);
    await handler.init();
  });

  it("should call the queue provider", async () => {
    const result = handler && await handler.call({
      method: "basic@latest:method",
      params: { add: [1, 2] },
      context,
    });

    assert(result);
    assertObjectMatch(result.data, {
      jsonrpc: "2.0",
      id: null,
      method: "basic@latest:method",
      params: { params: { add: [1, 2] }, _context: context },
    });
  });
});
