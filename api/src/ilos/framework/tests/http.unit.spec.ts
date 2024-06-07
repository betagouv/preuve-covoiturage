import {
  kernel as kernelDecorator,
  serviceProvider,
} from "@/ilos/common/index.ts";
import { ServiceProvider } from "@/ilos/core/index.ts";
import { httpHandlerFactory } from "@/ilos/handler-http/index.ts";
import { HttpTransport } from "@/ilos/transport-http/index.ts";
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
import { axios } from "@/deps.ts";
import { Kernel } from "../Kernel.ts";
import { ServiceProvider as MathServiceProvider } from "./mock/MathService/ServiceProvider.ts";
import { ServiceProvider as ParentStringServiceProvider } from "./mock/StringService/ServiceProvider.ts";

describe("http", () => {
  let mathPort: number;
  let stringPort: number;
  let mathKernel: Kernel;
  let mathTransport: HttpTransport;
  let stringKernel: Kernel;
  let stringTransport: HttpTransport;

  beforeAll(async () => {
    mathPort = await getAvailablePort() || 9090;
    stringPort = await getAvailablePort() || 9091;
    @serviceProvider({
      children: [ParentStringServiceProvider],
      handlers: [httpHandlerFactory("math", `http://127.0.0.1:${mathPort}`)],
    })
    class StringServiceProvider extends ServiceProvider {}

    @kernelDecorator({
      children: [MathServiceProvider],
    })
    class MathKernel extends Kernel {
      name = "math";
    }

    @kernelDecorator({
      children: [StringServiceProvider],
    })
    class StringKernel extends Kernel {
      name = "string";
    }
    mathKernel = new MathKernel();
    mathTransport = new HttpTransport(mathKernel);
    stringKernel = new StringKernel();
    stringTransport = new HttpTransport(stringKernel);
    await mathKernel.bootstrap();
    await mathTransport.up([`${mathPort}`]);
    await stringKernel.bootstrap();
    await stringTransport.up([`${stringPort}`]);
    await delay(1);
  });

  afterAll(async () => {
    await mathTransport.down();
    await stringTransport.down();
    await mathKernel.shutdown();
    await stringKernel.shutdown();
    await delay(1);
  });

  function makeRPCCall(port: number, req: { method: string; params?: any }[]) {
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
            method: req[i].method,
            params: req[i].params,
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
  it("Should work", async () => {
    const responseMath = await makeRPCCall(mathPort, [{
      method: "math:add",
      params: [1, 1],
    }]);
    assertObjectMatch(responseMath?.data, {
      jsonrpc: "2.0",
      id: 0,
      result: "math:2",
    });
  });

  it("Http only integration: should work", async () => {
    const responseString = await makeRPCCall(stringPort, [{
      method: "string:hello",
      params: { name: "sam" },
    }]);
    assertObjectMatch(responseString?.data, {
      jsonrpc: "2.0",
      id: 0,
      result: "string:Hello world sam",
    });
  });

  it("Http only integration: should work with internal service call", async () => {
    const response = await makeRPCCall(stringPort, [
      { method: "string:result", params: { name: "sam", add: [1, 1] } },
    ]);

    assertObjectMatch(response?.data, {
      jsonrpc: "2.0",
      id: 0,
      result: "string:Hello world sam, result is math:2",
    });
  });

  it("Http only integration: should work with batch call", async () => {
    const response = await makeRPCCall(stringPort, [
      { method: "string:result", params: { name: "sam", add: [1, 1] } },
      { method: "string:result", params: { name: "john", add: [1, 10] } },
    ]);
    assertEquals(response?.data, [
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
