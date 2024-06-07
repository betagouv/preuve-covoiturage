import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import { InitHookInterface, provider, serviceProvider } from '@/ilos/common/index.ts';

import { Providers } from './Providers.ts';
import { ServiceContainer } from '../foundation/ServiceContainer.ts';

it('Providers extension: works', async (t) => {
  abstract class ProviderResolver {
    scream(): string {
      throw new Error();
    }
  }

  @provider({
    identifier: ProviderResolver,
  })
  class Provider {
    scream(): string {
      return 'AAA';
    }
  }

  @serviceProvider({
    providers: [Provider],
  })
  class ServiceProvider extends ServiceContainer {
    extensions = [Providers];
  }
  const test = new ServiceProvider();

  await test.register();

  const screamer = test.getContainer().get(ProviderResolver);
  assertEquals(screamer.scream(), 'AAA');
});

it('Provider extension: works with multiple bindings', async (t) => {
  abstract class ProviderResolver {
    screamed = 0;
    scream(): string {
      throw new Error();
    }
  }

  @provider({
    identifier: [ProviderResolver, 'aaa'],
  })
  class Provider {
    screamed = 0;
    scream(): string {
      this.screamed = 1;
      return 'AAA';
    }
  }

  @serviceProvider({
    providers: [Provider],
  })
  class ServiceProvider extends ServiceContainer {
    extensions = [Providers];
  }

  const test = new ServiceProvider();

  await test.register();
  const container = test.getContainer();
  const screamer = container.get(ProviderResolver);
  assertEquals(screamer.scream(), 'AAA');
  const screamer1 = container.get<ProviderResolver>('aaa');
  assertEquals(screamer1.screamed, 1);
});

it('works with init hook', async (t) => {
  abstract class ProviderResolver {
    scream(): string {
      throw new Error();
    }
  }

  @provider({
    identifier: ProviderResolver,
  })
  class Provider implements InitHookInterface {
    screamType = 'AAA';
    init() {
      this.screamType = 'BBB';
    }
    scream(): string {
      return this.screamType;
    }
  }

  @serviceProvider({
    providers: [Provider],
  })
  class ServiceProvider extends ServiceContainer {
    extensions = [Providers];
  }
  const test = new ServiceProvider();

  await test.register();
  await test.init();

  const screamer = test.getContainer().get(ProviderResolver);
  assertEquals(screamer.scream(), 'BBB');
});
