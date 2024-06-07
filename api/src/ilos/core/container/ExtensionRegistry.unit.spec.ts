import { assertEquals, assert, assertFalse, assertThrows, assertObjectMatch, afterEach, beforeEach, afterAll, beforeAll, describe, it } from '@/dev_deps.ts';
import {
  injectable,
  extension,
  serviceProvider,
  extensionConfigurationMetadataKey,
  InitHookInterface,
  ServiceContainerInterface,
  ExtensionInterface,
  NewableType,
} from '@/ilos/common/index.ts';

import { ExtensionRegistry } from './ExtensionRegistry.ts';
import { ServiceContainer } from '../foundation/ServiceContainer.ts';

function setup() {
  @injectable()
  class Registry {
    public db: Set<{ config: any; data: any }> = new Set();
  }

  function createExtensionRegistry(
    extensions: NewableType<ExtensionInterface>[],
    config,
  ): [ExtensionRegistry, ServiceContainerInterface & InitHookInterface] {
    @serviceProvider(config)
    class CustomServiceContainer extends ServiceContainer {}

    const sp = new CustomServiceContainer();
    const er = new ExtensionRegistry(sp);
    for (const ext of extensions) {
      er.register(ext);
    }
    return [er, sp];
  }

  function createExtension(config): NewableType<ExtensionInterface> {
    @extension(config)
    class CustomExtension {
      constructor(public data) {
        //
      }
      init(serviceContainer: ServiceContainerInterface) {
        const registry = serviceContainer.get<Registry>('registry');
        registry.db.add({
          config: Reflect.getMetadata(extensionConfigurationMetadataKey, this.constructor),
          data: this.data,
        });
      }
    }
    return CustomExtension;
  }
  return {
    createExtensionRegistry,
    createExtension,
    Registry,
  };
}

it('Extension registry: register extension', async (t) => {
  const { createExtension, createExtensionRegistry } = setup();
  const extension1 = createExtension({
    name: 'hello',
  });

  const extension2 = createExtension({
    name: 'world',
  });

  const [extensionRegistry] = createExtensionRegistry([extension1, extension2], {});
  const extensions = extensionRegistry.all();
  assert(Array.isArray(extensions));
  assertEquals(extensions.length, 2);
});

it('Extension registry: override extension', async (t) => {
  const { createExtension, createExtensionRegistry } = setup();
  const extension2 = createExtension({
    name: 'world',
  });

  const extension2bis = createExtension({
    name: 'world',
    autoload: true,
    override: true,
  });

  const [extensionRegistry] = createExtensionRegistry([extension2, extension2bis], {});
  const extensions = extensionRegistry.all();
  assert(Array.isArray(extensions));
  assertEquals(extensions.length, 1);
  assertEquals(extensions[0].autoload, true);
});

it('Extension registry: get appliable', async (t) => {
  const { createExtension, createExtensionRegistry } = setup();
  const extension1 = createExtension({
    name: 'hello',
  });

  const extension2 = createExtension({
    name: 'world',
  });

  const extension2bis = createExtension({
    name: 'world',
    autoload: true,
    override: true,
  });

  const [extensionRegistry] = createExtensionRegistry([extension1, extension2, extension2bis], {
    hello: true,
  });

  const extensions = extensionRegistry.get();
  assert(Array.isArray(extensions));
  assertEquals(extensions.length, 2);
  assertEquals(extensions.find((cfg) => cfg.name === 'world').autoload, true);
});

it('Extension registry: get ordered', async (t) => {
  const { createExtension, createExtensionRegistry } = setup();
  const extension1 = createExtension({
    name: 'hello',
  });

  const extension2 = createExtension({
    name: 'world',
  });

  const extension2bis = createExtension({
    name: 'world',
    autoload: true,
    override: true,
    require: [extension1],
  });

  const [extensionRegistry] = createExtensionRegistry([extension2, extension1, extension2bis], {
    hello: true,
  });

  const extensions = extensionRegistry.get();
  assert(Array.isArray(extensions));
  assertEquals(extensions.length, 2);
  assertEquals(extensions[0].name, 'hello');
  assertEquals(extensions[1].name, 'world');
});

it('Extension registry: get complex ordered', async (t) => {
  const { createExtension, createExtensionRegistry } = setup();
  const ext6 = createExtension({
    name: 'six',
    autoload: true,
  });
  const ext5 = createExtension({
    name: 'five',
    autoload: true,
    require: [ext6],
  });
  const ext1 = createExtension({
    name: 'one',
    autoload: true,
    require: [ext5, ext6],
  });
  const ext2 = createExtension({
    name: 'two',
    autoload: true,
    require: [ext1],
  });
  const ext4 = createExtension({
    name: 'four',
    autoload: true,
    require: [ext2],
  });
  const ext3 = createExtension({
    name: 'three',
    autoload: true,
    require: [ext4],
  });

  const [extensionRegistry] = createExtensionRegistry([ext1, ext2, ext3, ext4, ext5, ext6], {
    hello: true,
  });

  const extensions = extensionRegistry.get();
  assert(Array.isArray(extensions));
  assertEquals(extensions.length, 6);
  assertObjectMatch(
    extensions.map((e) => e.name),
    ['six', 'five', 'one', 'two', 'four', 'three'],
  );
});

it('Extension registry: apply extension', async (t) => {
  const { Registry, createExtension, createExtensionRegistry } = setup();
  const extension1 = createExtension({
    name: 'hello',
  });

  const extension2 = createExtension({
    name: 'world',
  });

  const extension2bis = createExtension({
    name: 'world',
    autoload: true,
    override: true,
    require: [extension1],
  });

  const [extensionRegistry, serviceProvider] = createExtensionRegistry([extension2, extension1, extension2bis], {
    hello: true,
  });

  extensionRegistry.apply();
  serviceProvider.bind(Registry, 'registry');
  await serviceProvider.init();
  const registry = [...serviceProvider.get<any>('registry').db];
  assert(Array.isArray(registry));
  assertEquals(registry.length, 2);
  assertEquals(registry[0].config.name, 'hello');
  assertEquals(registry[0].data, true);
  assertEquals(registry[1].config.name, 'world');
  assertEquals(registry[1].data, undefined);
});
