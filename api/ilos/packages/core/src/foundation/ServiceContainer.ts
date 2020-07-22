import {
  ContainerInterface,
  ServiceContainerInterface,
  ServiceContainerInterfaceResolver,
  DestroyHookInterface,
  InitHookInterface,
  RegisterHookInterface,
  IdentifierType,
  NewableType,
  ExtensionInterface,
  DefaultLogger,
  CONTAINER_LOGGER_KEY,
} from '@ilos/common';

import { Container, HookRegistry } from '../container';
import { ExtensionRegistry } from '../container/ExtensionRegistry';

/**
 * Service container parent class
 * @export
 * @abstract
 * @class ServiceContainer
 * @implements {ServiceContainerInterface}
 */
export abstract class ServiceContainer
  implements ServiceContainerInterface, InitHookInterface, DestroyHookInterface, RegisterHookInterface {
  readonly extensions: NewableType<ExtensionInterface>[] = [];

  protected registerHookRegistry = new HookRegistry<RegisterHookInterface>('register', false);
  protected initHookRegistry = new HookRegistry<InitHookInterface>('init');
  protected destroyHookRegistry = new HookRegistry<DestroyHookInterface>('destroy');
  protected extensionRegistry: ExtensionRegistry;

  protected readonly container: ContainerInterface;
  protected readonly parent?: ServiceContainerInterface;

  constructor(container?: ContainerInterface) {
    this.container = container ? container.createChild() : new Container();
    this.registerSelf();
    this.registerLogger();
  }

  protected registerSelf() {
    this.container.bind(ServiceContainerInterfaceResolver).toConstantValue(this);
    this.extensionRegistry = new ExtensionRegistry(this);
    this.extensionRegistry.importFromParent();
  }

  protected registerLogger() {
    if (!this.container.isBound(CONTAINER_LOGGER_KEY)) {
      this.container.bind(CONTAINER_LOGGER_KEY).to(DefaultLogger);
    }
  }

  /**
   * Register hook add children and extension, then dispatch register
   * @memberof ServiceContainer
   */
  async register() {
    for (const extension of this.extensions) {
      this.extensionRegistry.register(extension);
    }
    this.extensionRegistry.apply();

    this.registerChildren();
    await this.registerHookRegistry.dispatch(this);
  }

  async init() {
    await this.initHookRegistry.dispatch(this);
  }

  async destroy() {
    await this.destroyHookRegistry.dispatch(this);
  }

  /**
   * Return the container
   * @returns {ContainerInterface}
   * @memberof ServiceProvider
   */
  public getContainer(): ContainerInterface {
    return this.container;
  }

  public registerHooks(hooker: object, identifier?: IdentifierType): void {
    this.registerHookRegistry.register(hooker, identifier);
    this.initHookRegistry.register(hooker, identifier);
    this.destroyHookRegistry.register(hooker, identifier);
    return;
  }

  protected registerChildren() {
    if (Reflect.hasMetadata(Symbol.for('extension:children'), this.constructor)) {
      const children = Reflect.getMetadata(Symbol.for('extension:children'), this.constructor);
      for (const child of children) {
        const childInstance = new child(this.getContainer());
        this.getContainer()
          .bind(child)
          .toConstantValue(childInstance);
        this.getContainer()
          .bind('children')
          .toConstantValue(child);
        this.registerHooks(childInstance);
      }
    }
  }

  public get<T>(identifier: IdentifierType<T>): T {
    return this.container.get<T>(identifier);
  }

  public bind(ctor: NewableType<any>, identifier?: IdentifierType) {
    this.container.bind(ctor).toSelf();
    if (identifier) {
      this.container.bind(identifier).toService(ctor);
      return;
    }

    const taggedIdentifier = Reflect.getMetadata(Symbol.for('extension:identifier'), ctor) as
      | IdentifierType
      | IdentifierType[];
    if (taggedIdentifier) {
      if (!Array.isArray(taggedIdentifier)) {
        this.container.bind(taggedIdentifier).toService(ctor);
      } else {
        for (const id of taggedIdentifier) {
          this.container.bind(id).toService(ctor);
        }
      }
    }
  }

  public ensureIsBound(identifier: IdentifierType, fallback?: NewableType<any>, fallbackIdentifier?: IdentifierType) {
    if (this.container.isBound(identifier)) {
      return;
    }

    if (fallback) {
      this.bind(fallback, fallbackIdentifier);
      return;
    }

    const name =
      typeof identifier === 'string'
        ? identifier
        : typeof identifier === 'function'
        ? identifier.name
        : identifier.toString();
    throw new Error(`Unable to find bindings for ${name}`);
  }

  public overrideBinding(identifier: IdentifierType, ctor: NewableType<any>) {
    if (this.container.isBound(identifier)) {
      this.container.unbind(identifier);
    }

    this.bind(ctor, identifier);
  }
}
