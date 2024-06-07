import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import {
  FunctionalHandlerInterface,
  MiddlewareInterface,
  ResultType,
  ParamsType,
  ContextType,
  middleware,
  NewableType,
  HandlerInterface,
  serviceProvider,
  handler,
} from '@/ilos/common/index.ts';

import { Kernel as AbstractKernel } from './Kernel.ts';
import { Action } from './Action.ts';

function setup() {
  const defaultContext = {
    channel: {
      service: '',
    },
  };

  @middleware()
  class MinusMiddleware implements MiddlewareInterface {
    async process(params, context, next) {
      const result = await next(params, context);
      return result - 1;
    }
  }

  @middleware()
  class HelloMiddleware implements MiddlewareInterface {
    async process(params, context, next) {
      const result = await next(params, context);
      return `hello ${result}?`;
    }
  }

  @middleware()
  class WorldMiddleware implements MiddlewareInterface {
    async process(params, context, next) {
      const result = await next(params, context);
      return `world ${result}!`;
    }
  }

  async function build(action: NewableType<HandlerInterface>): Promise<FunctionalHandlerInterface> {
    @serviceProvider({
      handlers: [action],
      middlewares: [
        ['minus', MinusMiddleware],
        ['hello', HelloMiddleware],
        ['world', WorldMiddleware],
      ],
    })
    class Kernel extends AbstractKernel {}
    const kernel = new Kernel();

    await kernel.bootstrap();
    return kernel
      .getContainer()
      .getHandlers()
      .map((h) => h.resolver as FunctionalHandlerInterface)
      .pop();
  }

  return {
    defaultContext,
    build,
  };
}

it('Action: works', async (t) => {
  const { defaultContext, build } = setup();
  @handler({
    service: 'action',
    method: 'test',
    middlewares: [],
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
  const action = await build(BasicAction);

  const result = await action({
    result: 0,
    method: 'action:test',
    params: {
      add: [1, 1],
    },
    context: defaultContext,
  });
  assertEquals(result, 2);
});

it('Action: should work with middleware', async (t) => {
  const { defaultContext, build } = setup();
  @handler({
    service: 'action',
    method: 'test',
    middlewares: ['minus'],
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
  const action = await build(BasicAction);
  const result = await action({
    result: 0,
    method: 'action:test',
    params: {
      add: [1, 1],
    },
    context: defaultContext,
  });

  assertEquals(result, 1);
});

it('Action: should work with ordered middleware', async (t) => {
  const { defaultContext, build } = setup();
  @handler({
    service: 'action',
    method: 'test',
    middlewares: ['hello', 'world'],
  })
  class BasicAction extends Action {
    protected async handle(params: ParamsType, context: ContextType): Promise<ResultType> {
      let result = '';
      if ('name' in params) {
        result = params.name;
      }
      return result;
    }
  }
  const action = await build(BasicAction);
  const result = await action({
    result: '',
    method: 'action:test',
    params: {
      name: 'Sam',
    },
    context: defaultContext,
  });
  assertEquals(result, 'hello world Sam!?');
});

it('should raise an error if no handle method is defined', async (t) => {
  const { defaultContext, build } = setup();
  @handler({
    service: 'action',
    method: 'test',
    middlewares: [],
  })
  class BasicAction extends Action {}
  const action = await build(BasicAction);
  const err = await assertThrows(async () =>
    action({
      result: {},
      method: 'action:test',
      params: {
        params: {
          name: 'Sam',
        },
      },
      context: defaultContext,
    }),
  );
  assert(err instanceof Error);
  assertEquals(err.message, 'No implementation found');
});
