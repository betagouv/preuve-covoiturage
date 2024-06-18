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
import { Action, Extensions, ServiceProvider } from "@/ilos/core/index.ts";
import { ConnectionManagerExtension } from "@/ilos/connection-manager/index.ts";
import { RedisConnection } from "@/ilos/connection-redis/index.ts";
import { handler, serviceProvider } from "@/ilos/common/index.ts";

import { QueueExtension } from "./QueueExtension.ts";

@handler({
  service: "serviceA",
  method: "hello",
})
class ServiceOneHandler extends Action {}

@handler({
  service: "serviceB",
  method: "world",
})
class ServiceTwoHandler extends Action {}

it("Queue extension: should register queue name in container as worker", async (t) => {
  @serviceProvider({
    queues: ["serviceA", "serviceB"],
    handlers: [ServiceOneHandler, ServiceTwoHandler],
    connections: [[
      RedisConnection,
      new RedisConnection("redis://localhost:6379"),
    ]],
  })
  class MyService extends ServiceProvider {
    extensions = [
      Extensions.Config,
      Extensions.Providers,
      Extensions.Handlers,
      ConnectionManagerExtension,
      QueueExtension,
    ];
  }

  const service = new MyService();
  await service.register();

  const container = service.getContainer();
  const queueRegistrySymbol = QueueExtension.containerKey;
  assert(container.isBound(queueRegistrySymbol));

  const queueRegistry = container.getAll(queueRegistrySymbol);

  assert(queueRegistry.indexOf("serviceA") > -1);
  assert(queueRegistry.indexOf("serviceB") > -1);
  assertEquals(container.getHandlers().length, 4);
});

it("should register queue name in container and handlers", async (t) => {
  @serviceProvider({
    env: null,
    queues: ["serviceA", "serviceB"],
    handlers: [ServiceOneHandler, ServiceTwoHandler],
    connections: [[
      RedisConnection,
      new RedisConnection("redis://localhost:6379"),
    ]],
  })
  class MyService extends ServiceProvider {
    extensions = [
      Extensions.Config,
      Extensions.Handlers,
      QueueExtension,
      ConnectionManagerExtension,
    ];
  }

  const service = new MyService();
  await service.register();

  const container = service.getContainer();
  const queueRegistrySymbol = QueueExtension.containerKey;
  assert(container.isBound(queueRegistrySymbol));

  const queueRegistry = container.getAll(queueRegistrySymbol);
  assert(queueRegistry.indexOf("serviceA") > -1);
  assert(queueRegistry.indexOf("serviceB") > -1);
  assertEquals(container.getHandlers().length, 4);
});
