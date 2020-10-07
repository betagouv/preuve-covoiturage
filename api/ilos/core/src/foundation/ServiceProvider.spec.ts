// tslint:disable no-shadowed-variable max-classes-per-file
import test from 'ava';
import {
  handler,
  provider,
  serviceProvider,
  ProviderInterface,
  ResultType,
  ParamsType,
  ContextType,
} from '@ilos/common';

import { ServiceProvider as ParentServiceProvider } from './ServiceProvider';
import { Action } from './Action';

const defaultContext = { channel: { service: '' } };

test('ServiceProvider: should register handler', async (t) => {
  @handler({
    service: 'test',
    method: 'add',
  })
  class BasicAction extends Action {
    protected async handle(params: ParamsType, context: ContextType): Promise<ResultType> {
      let count = 0;
      if ('add' in params) {
        const { add } = params;
        add.forEach((param) => {
          count += param;
        });
      }
      return count;
    }
  }
  @serviceProvider({
    handlers: [BasicAction],
  })
  class BasicServiceProvider extends ParentServiceProvider {}

  const sp = new BasicServiceProvider();
  await sp.register();
  await sp.init();

  const container = sp.getContainer();
  t.is(
    await container.getHandler({ service: 'test', method: 'add' })({
      params: {},
      context: defaultContext,
      method: '',
    }),
    0,
  );
});

test('ServiceProvider: should register handler with extension', async (t) => {
  abstract class TestResolver {
    hello(name) {
      throw new Error();
    }
  }

  @provider()
  class Test implements ProviderInterface {
    base: string;
    boot() {
      this.base = 'Hello';
    }
    hello(name) {
      return `${this.base} ${name}`;
    }
  }

  @handler({
    service: 'test',
    method: 'hi',
  })
  class BasicAction extends Action {
    constructor(private test: TestResolver) {
      super();
    }
    protected async handle(params: ParamsType, context: ContextType): Promise<ResultType> {
      if ('name' in params) {
        return this.test.hello(params.name);
      }
      throw new Error('Missing arguments');
    }
  }

  @serviceProvider({
    providers: [[TestResolver, Test]],
    handlers: [BasicAction],
  })
  class BasicServiceProvider extends ParentServiceProvider {}

  const sp = new BasicServiceProvider();
  await sp.register();
  await sp.init();

  const container = sp.getContainer();
  const handlerInstance = container.getHandler({ service: 'test', method: 'hi' });
  const response = await handlerInstance({ method: 'fake', params: { name: 'Sam' }, context: defaultContext });
  t.is(response, 'Hello Sam');
});

test('ServiceProvider: should register handler with alias and nested service providers', async (t) => {
  abstract class TestResolver {
    hello(name) {
      throw new Error();
    }
  }

  @provider({
    identifier: TestResolver,
  })
  class Test implements ProviderInterface {
    base: string;
    boot() {
      this.base = 'Hello';
    }
    hello(name) {
      const response = `${this.base} ${name}`;
      this.base = 'Hi';
      return response;
    }
  }

  @handler({
    service: 'test',
    method: 'hi',
  })
  class BasicAction extends Action {
    constructor(private test: TestResolver) {
      super();
    }
    protected async handle(params: ParamsType, context: ContextType): Promise<ResultType> {
      if ('name' in params) {
        return this.test.hello(params.name);
      }
      throw new Error('Missing arguments');
    }
  }

  @handler({
    service: 'test',
    method: 'add',
  })
  class BasicTwoAction extends Action {
    constructor(private test: TestResolver) {
      super();
    }
    protected async handle(params: ParamsType, context: ContextType): Promise<ResultType> {
      let count = 0;
      if ('add' in params) {
        const { add } = params;
        add.forEach((param) => {
          count += param;
        });
      }
      return this.test.hello(count);
    }
  }

  @serviceProvider({
    providers: [Test],
    handlers: [BasicTwoAction],
  })
  class BasicTwoServiceProvider extends ParentServiceProvider {}

  @serviceProvider({
    providers: [Test],
    children: [BasicTwoServiceProvider],
    handlers: [BasicAction],
  })
  class BasicServiceProvider extends ParentServiceProvider {}

  const sp = new BasicServiceProvider();
  await sp.register();
  await sp.init();

  const container = sp.getContainer();
  const handlerInstance = container.getHandler({ service: 'test', method: 'hi' });
  const response = await handlerInstance({ method: 'fake', params: { name: 'Sam' }, context: defaultContext });
  t.is(response, 'Hello Sam');

  const handlerTwoInstance = container.getHandler({ service: 'test', method: 'add' });
  const responseTwo = await handlerTwoInstance({
    method: 'fake',
    params: { add: [21, 21] },
    context: defaultContext,
  });
  t.is(responseTwo, 'Hello 42');

  const responseTwoBis = await handlerTwoInstance({
    method: 'fake',
    params: { add: [21, 21] },
    context: defaultContext,
  });
  t.is(responseTwoBis, 'Hi 42');
});
