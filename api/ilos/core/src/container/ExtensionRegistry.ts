import {
  ExtensionConfigurationType,
  extensionConfigurationMetadataKey,
  ServiceContainerInterface,
  ContainerInterface,
  ExtensionInterface,
  NewableType,
  FactoryType,
} from '@ilos/common';

import { DependencyTree } from '../helpers/DependencyTree';

export class ExtensionRegistry {
  static readonly key: symbol = Symbol.for('extensions');
  protected registry: Map<symbol, ExtensionConfigurationType> = new Map();
  protected container: ContainerInterface;

  constructor(protected serviceContainer: ServiceContainerInterface) {
    this.container = serviceContainer.getContainer();
  }

  importFromParent() {
    let extensions = [];
    try {
      extensions = this.container.getAll(ExtensionRegistry.key);
    } catch {
      //
    }
    extensions.forEach((config) => {
      this.registry.set(config.key, config);
    });
  }

  all(): ExtensionConfigurationType[] {
    try {
      return Array.from(this.registry.values());
    } catch {
      return [];
    }
  }

  get(): ExtensionConfigurationType[] {
    const isConfigured = (key: symbol): boolean => Reflect.hasMetadata(key, this.serviceContainer.constructor);

    const tree = new DependencyTree();
    this.all()
      .filter((config: ExtensionConfigurationType) => config.autoload || isConfigured(config.decoratorKey))
      .map((config) => ({
        ...config,
        require: config.require.map((extensionConstructor) => this.getExtensionConfig(extensionConstructor).key),
      }))
      .forEach((cfg) => tree.add(cfg.key, cfg, cfg.require));

    return tree.resolve();
  }

  register(extensionConstructor: NewableType<ExtensionInterface>) {
    const config = this.getExtensionConfig(extensionConstructor);

    if (this.container.isBound(config.key)) {
      if (!config.override) {
        return;
      }
      try {
        this.container.unbind(config.key);
      } catch {
        // do nothing, identifier is bound on parent
      }
      this.registry.delete(config.key);
    }

    this.container.bind(config.key).toFactory(() => (cfg) => new extensionConstructor(cfg));
    this.container.bind(ExtensionRegistry.key).toConstantValue(config);
    this.registry.set(config.key, config);
  }

  protected getExtensionConfig(extensionConstructor: NewableType<ExtensionInterface>) {
    if (!Reflect.hasMetadata(extensionConfigurationMetadataKey, extensionConstructor)) {
      throw new Error(`Wrong configuration for extension ${extensionConstructor}`);
    }

    return Reflect.getMetadata(extensionConfigurationMetadataKey, extensionConstructor);
  }

  apply() {
    const extensions = this.get();
    for (const extensionConfig of extensions) {
      let extensionCtorConfig: any;
      if (Reflect.hasMetadata(extensionConfig.decoratorKey, this.serviceContainer.constructor)) {
        extensionCtorConfig = Reflect.getMetadata(extensionConfig.decoratorKey, this.serviceContainer.constructor);
      }

      if (!extensionConfig.autoload && extensionCtorConfig === undefined) {
        throw new Error(`Missing config for extension ${extensionCtorConfig.name}`);
      }

      const extension = this.container.get<FactoryType<ExtensionInterface>>(extensionConfig.key)(extensionCtorConfig);
      this.serviceContainer.registerHooks(extension);
    }
  }
}
