import { ExtensionInterface } from './ExtensionInterface';
import { ContainerInterface, IdentifierType } from '../container';
import { NewableType } from '../shared';

// export type ServiceContainerConstructorInterface<T = any> = new (parent?: ServiceContainerInterface) => T;
export type ServiceContainerConstructorInterface<T = any> = new (parent?: ContainerInterface) => T;

export interface ServiceContainerInterface {
  readonly extensions: NewableType<ExtensionInterface>[];
  registerHooks(hooker: object, identifier?: IdentifierType): void;

  /**
   * Get the container
   * @returns {ContainerInterface}
   * @memberof ServiceProviderInterface
   */
  getContainer(): ContainerInterface;

  get<T>(identifier: IdentifierType<T>): T;
  bind(ctor: NewableType<any>, identifier?: IdentifierType): void;
  ensureIsBound(identifier: IdentifierType, fallback?: NewableType<any>): void;
  overrideBinding(identifier: IdentifierType, ctor: NewableType<any>): void;
}

export abstract class ServiceContainerInterfaceResolver implements ServiceContainerInterface {
  readonly extensions: NewableType<ExtensionInterface>[] = [];

  registerHooks(hooker: object, identifier?: IdentifierType): void {
    throw new Error();
  }

  getContainer(): ContainerInterface {
    throw new Error();
  }

  get<T>(identifier: IdentifierType<T>): T {
    throw new Error();
  }

  bind(ctor: NewableType<any>, identifier?: IdentifierType): void {
    throw new Error();
  }

  ensureIsBound(identifier: IdentifierType, fallback?: NewableType<any>): void {
    throw new Error();
  }

  overrideBinding(identifier: IdentifierType, ctor: NewableType<any>): void {
    throw new Error();
  }
}
