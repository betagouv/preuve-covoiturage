import { axios } from "@/deps.ts";
import {
  afterAll,
  assertEquals,
  assertObjectMatch,
  beforeAll,
  delay,
  describe,
  getAvailablePort,
  it,
} from "@/dev_deps.ts";
import { kernel as kernelDecorator } from "@/ilos/common/index.ts";
import { HttpTransport } from "@/ilos/transport-http/index.ts";
import { Kernel } from "../Kernel.ts";
import { ServiceProvider as MathServiceProvider } from "./mock/MathService/ServiceProvider.ts";
import { ServiceProvider as StringServiceProvider } from "./mock/StringService/ServiceProvider.ts";

/**
 * @fixme skipped due to random leaks
 * - RedisConnection is sometimes closed
 * - A file descriptor is dangling (from BullMQ ???)
 */
describe.skip("Merged integration", () => {
  @kernelDecorator({
    children: [MathServiceProvider, StringServiceProvider],
  })
  class MyKernel extends Kernel {}

  const kernel = new MyKernel();
  const transport = new HttpTransport(kernel);

  let port: number;

  function makeRPCCall(
    port: number,
    req: Array<{ method: string; params?: any }>,
  ) {
    try {
      let data;

      if (req.length === 1) {
        data = {
          jsonrpc: "2.0",
          method: req[0].method,
          params: req[0].params,
          id: 0,
        };
      } else {
        data = [];
        for (const i of Object.keys(req)) {
          data.push({
            jsonrpc: "2.0",
            method: req[i as any].method,
            params: req[i as any].params,
            id: Number(i),
          });
        }
      }

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

  beforeAll(async () => {
    port = await getAvailablePort() || 9090;
    await kernel.bootstrap();
    await transport.up([`${port}`]);
    await delay(1);
  });

  afterAll(async () => {
    await transport.down();
    await kernel.shutdown();
  });

  it("works I", async () => {
    const responseMath = await makeRPCCall(port, [{
      method: "math:add",
      params: [1, 1],
    }]);
    assertObjectMatch(responseMath?.data, {
      id: 0,
      jsonrpc: "2.0",
      result: "math:2",
    });
  });

  it("works II", async () => {
    const responseMath = await makeRPCCall(port, [{
      method: "string:hello",
      params: { name: "sam" },
    }]);
    assertObjectMatch(responseMath?.data, {
      jsonrpc: "2.0",
      id: 0,
      result: "string:Hello world sam",
    });
  });

  it("works III", async () => {
    const responseMath = await makeRPCCall(port, [
      { method: "string:result", params: { name: "sam", add: [1, 1] } },
      { method: "string:result", params: { name: "john", add: [1, 10] } },
    ]);
    assertEquals(responseMath?.data, [
      {
        jsonrpc: "2.0",
        id: 0,
        result: "string:Hello world sam, result is math:2",
      },
      {
        jsonrpc: "2.0",
        id: 1,
        result: "string:Hello world john, result is math:11",
      },
    ]);
  });
});
