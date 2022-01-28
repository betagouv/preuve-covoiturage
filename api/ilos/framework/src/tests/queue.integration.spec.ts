import anyTest, { TestFn } from 'ava';
import getPort from 'get-port';
import fs from 'fs';
import os from 'os';
import axios from 'axios';
import path from 'path';

import { HttpTransport } from '@ilos/transport-http';
import { QueueTransport } from '@ilos/transport-redis';
import { TransportInterface, KernelInterface, serviceProvider, kernel as kernelDecorator } from '@ilos/common';

import { Kernel } from '../Kernel';
import { ServiceProvider as ParentStringServiceProvider } from './mock/StringService/ServiceProvider';

const logPath = path.join(os.tmpdir(), `ilos-test-${new Date().getTime()}`);
process.env.APP_LOG_PATH = logPath;

const redisUrl = process.env.APP_REDIS_URL ?? 'redis://127.0.0.1:6379';

interface Context {
  stringTransport: TransportInterface;
  queueTransport: TransportInterface;
  stringCallerKernel: KernelInterface;
  stringCalleeKernel: KernelInterface;
  stringPort: number;
}

const test = anyTest as TestFn<Context>;

test.before(async (t) => {
  t.context.stringPort = await getPort();

  @serviceProvider({
    config: {
      redis: {
        connectionString: process.env.APP_REDIS_URL,
        connectionOptions: {},
      },
      log: {
        path: process.env.APP_LOG_PATH,
      },
    },
  })
  class StringServiceProvider extends ParentStringServiceProvider {}

  @kernelDecorator({
    children: [StringServiceProvider],
  })
  class StringKernel extends Kernel {
    name = 'string';
  }

  t.context.stringCallerKernel = new StringKernel();
  await t.context.stringCallerKernel.bootstrap();
  t.context.stringTransport = new HttpTransport(t.context.stringCallerKernel);
  await t.context.stringTransport.up([`${t.context.stringPort}`]);

  process.env.APP_WORKER = 'true';
  t.context.stringCalleeKernel = new StringKernel();
  await t.context.stringCalleeKernel.bootstrap();
  t.context.queueTransport = new QueueTransport(t.context.stringCalleeKernel);
  await t.context.queueTransport.up([redisUrl]);
});

test.after(async (t) => {
  await t.context.stringTransport.down();
  await t.context.queueTransport.down();
  await t.context.stringCalleeKernel.shutdown();
  await t.context.stringCallerKernel.shutdown();
});

function makeRPCNotify(port: number, req: { method: string; params?: any }) {
  try {
    const data = {
      jsonrpc: '2.0',
      method: req.method,
      params: req.params,
    };

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

test('Queue integration: works', async (t) => {
  const data = { name: 'sam' };
  const result = await makeRPCNotify(t.context.stringPort, { method: 'string:log', params: data });
  t.is(result.data, '');
  t.is(result.status, 204);
  t.is(result.statusText, 'No Content');

  function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  await timeout(200);

  const content = fs.readFileSync(logPath, { encoding: 'utf8', flag: 'r' });
  console.info('reading file content', { content });
  t.is(content, JSON.stringify(data));
});
