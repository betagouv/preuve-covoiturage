import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { handler } from '@/ilos/common/index.ts';

import { Container } from '../index.ts';
import { Action } from '../foundation/Action.ts';
import { HandlerRegistry } from './HandlerRegistry.ts';

const defaultCallOptions = {
  method: '',
  params: null,
  context: null,
};

it('Handler registry: works', async (t) => {
  @handler({
    service: 'hello',
    method: 'world',
  })
  class HelloLocal extends Action {
    async call() {
      return 'HelloLocal';
    }
  }

  @handler({
    service: 'hello',
    method: 'world',
    queue: true,
  })
  class HelloLocalQueue extends Action {
    async call() {
      return 'HelloLocalQueue';
    }
  }

  @handler({
    service: 'hello',
    method: '*',
  })
  class HelloLocalStar extends Action {
    async call() {
      return 'HelloLocalStar';
    }
  }

  @handler({
    service: 'hello',
    method: 'world',
    local: false,
  })
  class HelloRemote extends Action {
    async call() {
      return 'HelloRemote';
    }
  }

  @handler({
    service: 'hello',
    method: 'world',
    queue: true,
    local: false,
  })
  class HelloRemoteQueue extends Action {
    async call() {
      return 'HelloRemoteQueue';
    }
  }

  @handler({
    service: 'hello',
    method: '*',
    local: false,
  })
  class HelloRemoteStar extends Action {
    async call() {
      return 'HelloRemoteStar';
    }
  }

  const container = new Container();
  const handlerRegistry = new HandlerRegistry(container);

  handlerRegistry.set(HelloLocal);
  handlerRegistry.set(HelloLocalQueue);
  handlerRegistry.set(HelloLocalStar);
  handlerRegistry.set(HelloRemote);
  handlerRegistry.set(HelloRemoteQueue);
  handlerRegistry.set(HelloRemoteStar);

  assert(
    (await handlerRegistry.get({
      service: 'hello',
      method: 'world',
      local: true,
    })(defaultCallOptions)) === 'HelloLocal',
  );

  assert(
    (await handlerRegistry.get({
      service: 'hello',
      method: 'world',
      local: true,
      queue: true,
    })(defaultCallOptions)) === 'HelloLocalQueue',
  );

  assert(
    (await handlerRegistry.get({
      service: 'hello',
      method: '*',
      local: true,
    })(defaultCallOptions)) === 'HelloLocalStar',
  );

  assert(
    (await handlerRegistry.get({
      service: 'hello',
      method: 'notExisting',
      local: true,
    })(defaultCallOptions)) === 'HelloLocalStar',
  );

  assert(
    (await handlerRegistry.get({
      service: 'hello',
      method: 'world',
      local: false,
    })(defaultCallOptions)) === 'HelloRemote',
  );

  assert(
    (await handlerRegistry.get({
      service: 'hello',
      method: 'world',
      local: false,
      queue: true,
    })(defaultCallOptions)) === 'HelloRemote',
  );

  assert(
    (await handlerRegistry.get({
      service: 'hello',
      method: '*',
      local: false,
    })(defaultCallOptions)) === 'HelloRemoteStar',
  );

  assert(
    (await handlerRegistry.get({
      service: 'hello',
      method: 'notExisting',
      local: false,
    })(defaultCallOptions)) === 'HelloRemoteStar',
  );
});

it('Handler registry: fallback to remote', async (t) => {
  @handler({
    service: 'hello',
    method: 'world',
    local: false,
  })
  class HelloRemote extends Action {
    async call() {
      return 'HelloRemote';
    }
  }

  @handler({
    service: 'hello',
    method: '*',
    local: false,
  })
  class HelloRemoteStar extends Action {
    async call() {
      return 'HelloRemoteStar';
    }
  }

  const container = new Container();
  const handlerRegistry = new HandlerRegistry(container);

  handlerRegistry.set(HelloRemote);
  handlerRegistry.set(HelloRemoteStar);

  assert(
    (await handlerRegistry.get({
      service: 'hello',
      method: 'world',
      local: true,
    })(defaultCallOptions)) === 'HelloRemote',
  );

  assert(
    (await handlerRegistry.get({
      service: 'hello',
      method: 'truc',
      local: true,
      queue: true,
    })(defaultCallOptions)) === 'HelloRemoteStar',
  );
});
it('Handler registry: fallback to sync', async (t) => {
  @handler({
    service: 'hello',
    method: 'world',
  })
  class HelloLocal extends Action {
    async call() {
      return 'HelloLocal';
    }
  }

  @handler({
    service: 'hello',
    method: '*',
    local: false,
  })
  class HelloRemoteStar extends Action {
    async call() {
      return 'HelloRemoteStar';
    }
  }

  const container = new Container();
  const handlerRegistry = new HandlerRegistry(container);

  handlerRegistry.set(HelloLocal);
  handlerRegistry.set(HelloRemoteStar);

  assert(
    (await handlerRegistry.get({
      service: 'hello',
      method: 'world',
      queue: true,
      local: true,
    })(defaultCallOptions)) === 'HelloLocal',
  );

  assert(
    (await handlerRegistry.get({
      service: 'hello',
      method: 'truc',
      queue: true,
      local: true,
    })(defaultCallOptions)) === 'HelloRemoteStar',
  );

  assert(
    (await handlerRegistry.get({
      service: 'hello',
      method: 'world',
      local: false,
      queue: true,
    })(defaultCallOptions)) === 'HelloRemoteStar',
  );
});
