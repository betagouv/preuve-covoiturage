import axios from 'axios';
import getPort from 'get-port';
import anyTest, { TestInterface } from 'ava';

import { HttpTransport } from '@ilos/transport-http';
import { httpHandlerFactory } from '@ilos/handler-http';
import { ServiceProvider } from '@ilos/core';
import { serviceProvider, kernel as kernelDecorator, TransportInterface, KernelInterface } from '@ilos/common';

import { Kernel } from '../Kernel';
import { ServiceProvider as MathServiceProvider } from './mock/MathService/ServiceProvider';
import { ServiceProvider as ParentStringServiceProvider } from './mock/StringService/ServiceProvider';

interface Context {
  mathTransport: TransportInterface;
  stringTransport: TransportInterface;
  mathKernel: KernelInterface;
  stringKernel: KernelInterface;
  mathPort: number;
  stringPort: number;
}

const test = anyTest as TestInterface<Context>;

test.before(async (t) => {
  t.context.mathPort = await getPort();
  t.context.stringPort = await getPort();

  @serviceProvider({
    children: [ParentStringServiceProvider],
    handlers: [httpHandlerFactory('math', `http://127.0.0.1:${t.context.mathPort}`)],
  })
  class StringServiceProvider extends ServiceProvider {}

  @kernelDecorator({
    children: [MathServiceProvider],
  })
  class MathKernel extends Kernel {
    name = 'math';
  }

  @kernelDecorator({
    children: [StringServiceProvider],
  })
  class StringKernel extends Kernel {
    name = 'string';
  }

  t.context.mathKernel = new MathKernel();
  await t.context.mathKernel.bootstrap();

  t.context.mathTransport = new HttpTransport(t.context.mathKernel);
  await t.context.mathTransport.up([`${t.context.mathPort}`]);

  t.context.stringKernel = new StringKernel();
  await t.context.stringKernel.bootstrap();
  t.context.stringTransport = new HttpTransport(t.context.stringKernel);
  await t.context.stringTransport.up([`${t.context.stringPort}`]);
});

test.after(async (t) => {
  await t.context.mathTransport.down();
  await t.context.stringTransport.down();
  await t.context.mathKernel.shutdown();
  await t.context.stringKernel.shutdown();
});

function makeRPCCall(port: number, req: { method: string; params?: any }[]) {
  try {
    let data;

    if (req.length === 1) {
      data = {
        jsonrpc: '2.0',
        method: req[0].method,
        params: req[0].params,
        id: 0,
      };
    } else {
      data = [];
      for (const i of Object.keys(req)) {
        data.push({
          jsonrpc: '2.0',
          method: req[i].method,
          params: req[i].params,
          id: Number(i),
        });
      }
    }
    return axios.post(`http://127.0.0.1:${port}`, data, {
      headers: {
        Accept: 'application/json',
        'Content-type': 'application/json',
      },
    });
  } catch (e) {
    console.log(e.message);
    console.log(e.response.data);
  }
}

test('Http only integration: should works', async (t) => {
  const responseMath = await makeRPCCall(t.context.mathPort, [{ method: 'math:add', params: [1, 1] }]);
  t.deepEqual(responseMath.data, {
    jsonrpc: '2.0',
    id: 0,
    result: 'math:2',
  });

  const responseString = await makeRPCCall(t.context.stringPort, [{ method: 'string:hello', params: { name: 'sam' } }]);
  t.deepEqual(responseString.data, {
    jsonrpc: '2.0',
    id: 0,
    result: 'string:Hello world sam',
  });
});

test('Http only integration: should works with internal service call', async (t) => {
  const response = await makeRPCCall(t.context.stringPort, [
    { method: 'string:result', params: { name: 'sam', add: [1, 1] } },
  ]);

  t.deepEqual(response.data, {
    jsonrpc: '2.0',
    id: 0,
    result: 'string:Hello world sam, result is math:2',
  });
});

test('Http only integration: should works with batch call', async (t) => {
  const response = await makeRPCCall(t.context.stringPort, [
    { method: 'string:result', params: { name: 'sam', add: [1, 1] } },
    { method: 'string:result', params: { name: 'john', add: [1, 10] } },
  ]);
  t.deepEqual(response.data, [
    {
      jsonrpc: '2.0',
      id: 0,
      result: 'string:Hello world sam, result is math:2',
    },
    {
      jsonrpc: '2.0',
      id: 1,
      result: 'string:Hello world john, result is math:11',
    },
  ]);
});
