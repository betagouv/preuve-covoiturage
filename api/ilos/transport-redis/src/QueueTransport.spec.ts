import anyTest, { TestInterface } from 'ava';
import sinon from 'sinon';
import { Extensions, Action, ServiceProvider, Kernel } from '@ilos/core';
import { QueueExtension as ParentQueueExtension } from '@ilos/queue';
import { handler, serviceProvider, kernel as kernelDecorator, ParamsType, ContextType, ResultType } from '@ilos/common';

import * as Bull from './helpers/bullFactory';
import { QueueTransport } from './QueueTransport';

interface Context {
  sandbox: sinon.SinonSandbox;
}

const test = anyTest as TestInterface<Context>;

test.beforeEach((t) => {
  t.context.sandbox = sinon.createSandbox();
  process.env.APP_WORKER = 'true';
  t.context.sandbox.stub(Bull, 'bullFactory').callsFake(
    // @ts-ignore
    (name) => ({
      name,
      async process(fn) {
        this.fn = fn;
        return;
      },
      async close() {
        return;
      },
      async isReady() {
        return this;
      },
      on(event: string, callback: (...args: any[]) => void) {
        return this;
      },
      async add(call) {
        const fn = this.fn;
        return fn(call);
      },
    }),
  );
});

test.afterEach((t) => {
  t.context.sandbox.restore();
});

test('Queue transport: works', async (t) => {
  class QueueExtension extends ParentQueueExtension {
    registerQueueHandlers() {
      return;
    }
  }

  @handler({
    service: 'math',
    method: 'minus',
  })
  class BasicAction extends Action {
    protected async handle(params: ParamsType, context: ContextType): Promise<ResultType> {
      let count = 0;
      if ('minus' in params) {
        const { add } = params;
        add.forEach((param) => {
          count -= param;
        });
      } else {
        throw new Error('Please provide add param');
      }
      return count;
    }
  }

  @handler({
    service: 'math',
    method: 'add',
  })
  class BasicTwoAction extends Action {
    protected async handle(params: ParamsType, context: ContextType): Promise<ResultType> {
      let count = 0;
      if ('add' in params) {
        const { add } = params;
        add.forEach((param) => {
          count += param;
        });
      } else {
        throw new Error('Please provide add param');
      }
      return count;
    }
  }

  @serviceProvider({
    handlers: [BasicAction, BasicTwoAction],
    queues: ['math'],
  })
  class BasicServiceProvider extends ServiceProvider {
    extensions = [Extensions.Config, Extensions.Providers, Extensions.Handlers, QueueExtension];
  }

  @kernelDecorator({
    children: [BasicServiceProvider],
  })
  class BasicKernel extends Kernel {}

  const kernel = new BasicKernel();
  await kernel.bootstrap();
  const queueTransport = new QueueTransport(kernel);
  await queueTransport.up(['redis://localhost']);
  t.is(queueTransport.queues.length, 1);
  t.is(queueTransport.queues[0].name, 'math');
  const response = await queueTransport.queues[0].add({
    data: {
      id: null,
      jsonrpc: '2.0',
      method: 'math@latest:add',
      params: {
        params: {
          add: [1, 2],
        },
        _context: {
          transport: 'http',
          user: 'me',
          internal: false,
        },
      },
    },
  });
  t.is(response as any, 3);
  await queueTransport.down();
});
