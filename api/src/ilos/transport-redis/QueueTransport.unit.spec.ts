import { process } from "@/deps.ts";
import {
  afterAll,
  afterEach,
  assertEquals,
  beforeEach,
  describe,
  it,
  sinon,
} from "@/dev_deps.ts";
import {
  ContextType,
  handler,
  kernel as kernelDecorator,
  KernelInterface,
  ParamsType,
  ResultType,
  serviceProvider,
} from "@/ilos/common/index.ts";
import { ConnectionManagerExtension } from "@/ilos/connection-manager/index.ts";
import { RedisConnection } from "@/ilos/connection-redis/index.ts";
import {
  Action,
  Extensions,
  Kernel,
  ServiceProvider,
} from "@/ilos/core/index.ts";
import { QueueExtension as ParentQueueExtension } from "@/ilos/queue/index.ts";
import { QueueTransport } from "./QueueTransport.ts";

describe("QueueTransport", () => {
  let sandbox: sinon.SinonSandbox;
  let transport: QueueTransport;
  let kernel: KernelInterface;

  // Connection is configured but not connected
  const redis = new RedisConnection("redis://localhost:6379", {
    lazyConnect: true,
  });

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    process.env.APP_WORKER = "true";

    class QueueExtension extends ParentQueueExtension {
      registerQueueHandlers() {
        return;
      }
    }

    @handler({
      service: "math",
      method: "minus",
    })
    class BasicAction extends Action {
      protected async handle(
        params: ParamsType,
        _context: ContextType,
      ): Promise<ResultType> {
        let count = 0;
        if ("minus" in params) {
          const { add } = params;
          add.forEach((param: number) => {
            count -= param;
          });
        } else {
          throw new Error("Please provide add param");
        }
        return count;
      }
    }

    @handler({
      service: "math",
      method: "add",
    })
    class BasicTwoAction extends Action {
      protected async handle(
        params: ParamsType,
        _context: ContextType,
      ): Promise<ResultType> {
        let count = 0;
        if ("add" in params) {
          const { add } = params;
          add.forEach((param: number) => {
            count += param;
          });
        } else {
          throw new Error("Please provide add param");
        }
        return count;
      }
    }

    @serviceProvider({
      handlers: [BasicAction, BasicTwoAction],
      queues: ["math"],
    })
    class BasicServiceProvider extends ServiceProvider {
      extensions = [
        Extensions.Config,
        Extensions.Providers,
        Extensions.Handlers,
        QueueExtension,
      ];
    }

    @kernelDecorator({
      children: [BasicServiceProvider],

      /**
       * RedisConnection is connects here
       * there no need to do a redis.up() in the beforeAll() hook
       */
      connections: [[RedisConnection, redis]],
    })
    class BasicKernel extends Kernel {
      readonly extensions = [Extensions.Config, ConnectionManagerExtension];
    }

    kernel = new BasicKernel();
    await kernel.bootstrap();
    transport = new QueueTransport(kernel);

    const fake = (
      _connection: RedisConnection,
      name: string,
      processor: Function,
    ) => ({
      name,
      async close() {
        return;
      },
      async waitUntilReady() {
        return this;
      },
      on(event: string, callback: (...args: any[]) => void) {
        return this;
      },
      async add(call: any) {
        return processor(call);
      },
    });

    sandbox.stub(transport, "getWorker").callsFake(fake);
    sandbox.stub(transport, "getScheduler").callsFake(fake);
  });

  afterEach(() => {
    sandbox.restore();
  });

  afterAll(async () => {
    await transport?.down();
    await kernel?.shutdown();
  });

  it("should call a handle as a job", async () => {
    if (!transport) {
      throw new Error("Transport is not initialized");
    }

    await transport.up();
    assertEquals(transport.queues.length, 1);
    assertEquals(transport.queues[0].worker.name, "math");

    // @ts-ignore
    const response = await transport.queues[0].worker.add({
      data: {
        id: null,
        jsonrpc: "2.0",
        method: "math@latest:add",
        params: {
          params: {
            add: [1, 2],
          },
          _context: {
            transport: "node:http",
            user: "me",
            internal: false,
          },
        },
      },
    });

    assertEquals(response, 3);
  });
});
