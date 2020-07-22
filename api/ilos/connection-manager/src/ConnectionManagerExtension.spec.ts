// tslint:disable max-classes-per-file
import test from 'ava';
import { ServiceProvider as BaseServiceProvider, Extensions } from '@ilos/core';
import { provider, serviceProvider, ConnectionInterface } from '@ilos/common';

import { ConnectionManagerExtension } from './ConnectionManagerExtension';

function setup() {
  class FakeDriverOne implements ConnectionInterface {
    constructor(public config: object) {
      //
    }

    async up(): Promise<void> {
      return;
    }

    async down(): Promise<void> {
      return;
    }

    getClient(): any {
      return this.config;
    }
  }

  class FakeDriverTwo implements ConnectionInterface {
    constructor(public config: object) {
      //
    }

    async up(): Promise<void> {
      return;
    }

    async down(): Promise<void> {
      return;
    }

    getClient(): any {
      return this.config;
    }
  }

  class FakeDriverThree implements ConnectionInterface {
    constructor(public config: object) {
      //
    }

    async up(): Promise<void> {
      return;
    }

    async down(): Promise<void> {
      return;
    }

    getClient() {
      return this.config;
    }
  }

  @provider()
  class FakeProviderOne {
    constructor(public driverOne: FakeDriverOne, public driverTwo: FakeDriverTwo, public driverThree: FakeDriverThree) {
      //
    }
  }

  @provider()
  class FakeProviderTwo {
    constructor(public driverOne: FakeDriverOne, public driverTwo: FakeDriverTwo, public driverThree: FakeDriverThree) {
      //
    }
  }

  @serviceProvider({
    config: {
      hello: {
        world: {
          hello: 'world',
        },
        you: {
          hello: 'you',
        },
      },
    },
    connections: [
      {
        use: FakeDriverOne,
        withConfig: 'hello.world',
        inside: [FakeProviderOne],
      },
      {
        use: FakeDriverOne,
        withConfig: 'hello.world',
        inside: [FakeProviderTwo],
      },
      {
        use: FakeDriverTwo,
        withConfig: 'hello.you',
        inside: [FakeProviderOne, FakeProviderTwo],
      },
      {
        use: FakeDriverThree,
        withConfig: 'hello.world',
        inside: [FakeProviderOne],
      },
      [FakeDriverThree, 'hello.you'],
    ],
  })
  class ServiceProvider extends BaseServiceProvider {
    readonly extensions = [Extensions.Config, Extensions.Providers, ConnectionManagerExtension];
  }

  return {
    serviceProvider: new ServiceProvider(),
    FakeDriverOne,
    FakeDriverTwo,
    FakeDriverThree,
    FakeProviderOne,
    FakeProviderTwo,
  };
}

test('Connection manager: container should work', async (t) => {
  const { serviceProvider, FakeProviderOne, FakeProviderTwo, FakeDriverOne, FakeDriverTwo, FakeDriverThree } = setup();

  await serviceProvider.register();
  await serviceProvider.init();
  const p1 = serviceProvider.getContainer().get(FakeProviderOne);
  const p2 = serviceProvider.getContainer().get(FakeProviderTwo);

  // all instances are bound
  t.true(p1.driverOne instanceof FakeDriverOne);
  t.true(p1.driverTwo instanceof FakeDriverTwo);
  t.true(p1.driverThree instanceof FakeDriverThree);

  t.true(p2.driverOne instanceof FakeDriverOne);
  t.true(p2.driverTwo instanceof FakeDriverTwo);
  t.true(p2.driverThree instanceof FakeDriverThree);

  // shared = false
  t.falsy(p1.driverOne === p2.driverOne);
  // shared = true
  t.true(p1.driverTwo === p2.driverTwo);
  // shared = true but config is different
  t.falsy(p1.driverThree === p2.driverThree);
});
