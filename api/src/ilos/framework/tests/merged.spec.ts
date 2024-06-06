import { KernelInterface, TransportInterface, kernel as kernelDecorator } from '@/ilos/common/index.ts';
import { HttpTransport } from '@/ilos/transport-http/index.ts';
import { getPorts } from '@/pdc/helpers/ports.helper.ts';
import anyTest, { TestFn } from 'ava';
import axios from 'axios';
import { Kernel } from '../Kernel.ts';
import { ServiceProvider as MathServiceProvider } from './mock/MathService/ServiceProvider.ts';
import { ServiceProvider as StringServiceProvider } from './mock/StringService/ServiceProvider.ts';

interface Context {
  transport: TransportInterface;
  kernel: KernelInterface;
  port: number;
}

const test = anyTest as TestFn<Context>;

test.before(async (t) => {
  t.context.port = await getPorts();

  @kernelDecorator({
    children: [MathServiceProvider, StringServiceProvider],
  })
  class MyKernel extends Kernel {}

  t.context.kernel = new MyKernel();
  await t.context.kernel.bootstrap();
  t.context.transport = new HttpTransport(t.context.kernel);
  await t.context.transport.up([`${t.context.port}`]);
});

test.after(async (t) => {
  await t.context.transport.down();
  await t.context.kernel.shutdown();
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
    console.error(e.message, e.response.data);
  }
}

test('Merged integration: works I', async (t) => {
  const responseMath = await makeRPCCall(t.context.port, [{ method: 'math:add', params: [1, 1] }]);
  t.deepEqual(responseMath.data, { jsonrpc: '2.0', id: 0, result: 'math:2' });
});

test('Merged integration: works II', async (t) => {
  const responseMath = await makeRPCCall(t.context.port, [{ method: 'string:hello', params: { name: 'sam' } }]);
  t.deepEqual(responseMath.data, { jsonrpc: '2.0', id: 0, result: 'string:Hello world sam' });
});

test('Merged integration: works III', async (t) => {
  const responseMath = await makeRPCCall(t.context.port, [
    { method: 'string:result', params: { name: 'sam', add: [1, 1] } },
    { method: 'string:result', params: { name: 'john', add: [1, 10] } },
  ]);
  t.deepEqual(responseMath.data, [
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
