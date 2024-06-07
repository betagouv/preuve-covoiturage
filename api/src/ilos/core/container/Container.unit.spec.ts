import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { HandlerInterface, handler, lib, provider, inject } from '@/ilos/common/index.ts';

import { Container } from '../index.ts';

it('Container: works', async (t) => {
  @lib()
  class Hello {
    public world = '!!';
  }

  @handler({
    service: 'test',
    method: 'hello',
  })
  class Test implements HandlerInterface {
    public readonly middlewares = [];
    constructor(public hello: Hello) {}

    async call() {
      return this.hello.world;
    }
  }

  const container = new Container();
  const h = container.resolve(Test);
  assertEquals(h.hello.world, '!!');

  container.setHandler(Test);

  const hBis = await container.getHandler<null, null, string>({
    service: 'test',
    method: 'hello',
  })({
    method: '',
    params: null,
    context: null,
  });
  assertEquals(hBis, '!!');
});

it('Container: works with provider', async (t) => {
  @lib()
  class HelloLib {
    public world = 'yeah';
  }

  @provider()
  class Hello {
    public world = '!!';
    @inject(HelloLib) helloLib: HelloLib;

    boot() {
      this.world = this.helloLib.world;
    }
  }

  @handler({
    service: 'test',
    method: 'hello',
  })
  class Test implements HandlerInterface {
    public readonly middlewares = [];
    constructor(public hello: Hello) {}

    async call() {
      return this.hello.world;
    }
  }

  const container = new Container();
  const h = container.resolve(Test);
  assertEquals(h.hello.world, 'yeah');

  container.setHandler(Test);
  const hbis = await container.getHandler<null, null, string>({
    service: 'test',
    method: 'hello',
  })({
    method: '',
    params: null,
    context: null,
  });
  assertEquals(hbis, 'yeah');
});
it('Container: works with no boot provider', async (t) => {
  @provider()
  class Hello {
    public world = 'yeah';
  }

  @handler({
    service: 'test',
    method: 'hello',
  })
  class Test implements HandlerInterface {
    public readonly middlewares = [];
    constructor(public hello: Hello) {}

    async call() {
      return this.hello.world;
    }
  }

  const container = new Container();
  const h = container.resolve(Test);
  assertEquals(h.hello.world, 'yeah');

  container.setHandler(Test);

  const hbis = await container.getHandler<null, null, string>({
    service: 'test',
    method: 'hello',
  })({
    method: '',
    params: null,
    context: null,
  });
  assertEquals(hbis, 'yeah');
});
