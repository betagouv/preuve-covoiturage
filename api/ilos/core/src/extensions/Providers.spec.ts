// tslint:disable max-classes-per-file
import test from 'ava';
import { InitHookInterface, provider, serviceProvider } from '@ilos/common';

import { Providers } from './Providers';
import { ServiceContainer } from '../foundation/ServiceContainer';

test('Providers extension: works', async (t) => {
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
  t.is(screamer.scream(), 'AAA');
});

test('Provider extension: works with multiple bindings', async (t) => {
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
  t.is(screamer.scream(), 'AAA');
  const screamer1 = container.get<ProviderResolver>('aaa');
  t.is(screamer1.screamed, 1);
});

test('works with init hook', async (t) => {
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
  t.is(screamer.scream(), 'BBB');
});
