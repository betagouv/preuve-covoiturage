import { axios, os, path, process, readFile } from "@/deps.ts";
import {
  afterAll,
  assertEquals,
  beforeAll,
  delay,
  describe,
  getAvailablePort,
  it,
} from "@/dev_deps.ts";
import {
  kernel as kernelDecorator,
  serviceProvider,
} from "@/ilos/common/index.ts";
import { RedisConnection } from "@/ilos/connection-redis/index.ts";
import { HttpTransport } from "@/ilos/transport-http/index.ts";
import { QueueTransport } from "@/ilos/transport-redis/index.ts";
import { Kernel } from "../Kernel.ts";
import { ServiceProvider as ParentStringServiceProvider } from "./mock/StringService/ServiceProvider.ts";

/**
 * @fixme SKIP due to timeout leak in bullMQ
 */
describe.skip("queue", () => {
  const logPath = path.join(os.tmpdir(), `ilos-test-${new Date().getTime()}`);
  process.env.APP_LOG_PATH = logPath;

  const redisUrl = process.env.APP_REDIS_URL ?? "redis://127.0.0.1:6379";
  @serviceProvider({
    config: {
      log: {
        path: process.env.APP_LOG_PATH,
      },
    },
    connections: [[
      RedisConnection,
      new RedisConnection({ redis: process.env.APP_REDIS_URL }),
    ]],
  })
  class StringServiceProvider extends ParentStringServiceProvider {}

  @kernelDecorator({
    children: [StringServiceProvider],
    connections: [[
      RedisConnection,
      new RedisConnection({ redis: process.env.APP_REDIS_URL }),
    ]],
  })
  class StringKernel extends Kernel {
    name = "string";
  }

  let port: number;
  const stringCallerKernel = new StringKernel();
  const stringTransport = new HttpTransport(stringCallerKernel);
  const stringCalleeKernel = new StringKernel();
  const queueTransport = new QueueTransport(stringCalleeKernel);

  beforeAll(async () => {
    port = await getAvailablePort() || 8080;

    await stringCallerKernel.bootstrap();
    await stringTransport.up([`${port}`]);

    process.env.APP_WORKER = "true";
    await stringCalleeKernel.bootstrap();
    await queueTransport.up([redisUrl]);
    await delay(1);
  });

  afterAll(async () => {
    await stringTransport.down();
    await queueTransport.down();
    await stringCalleeKernel.shutdown();
    await stringCallerKernel.shutdown();
  });

  function makeRPCNotify(port: number, req: { method: string; params?: any }) {
    try {
      const data = {
        jsonrpc: "2.0",
        method: req.method,
        params: req.params,
      };

      return axios.post(`http://127.0.0.1:${port}`, data, {
        headers: {
          Accept: "application/json",
          "Content-type": "application/json",
        },
      });
    } catch (e) {
      console.error(e.message, e.response.data);
    }
  }

  it("Queue integration: works", async (t) => {
    const data = { name: "sam" };
    const result = await makeRPCNotify(port, {
      method: "string:log",
      params: data,
    });
    assertEquals(result?.data, "");
    assertEquals(result?.status, 204);
    assertEquals(result?.statusText, "No Content");

    await new Promise((resolve) => setTimeout(resolve, 200));

    const content = await readFile(logPath, { encoding: "utf8", flag: "r" });
    console.info("reading file content", { content });
    assertEquals(content, JSON.stringify(data));
  });
});
