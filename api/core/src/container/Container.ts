import 'reflect-metadata';
import {
  Container as InversifyContainer,
  ContainerModule as InversifyContainerModule,
  interfaces,
} from 'inversify';

import { HandlerInterface } from '../interfaces/HandlerInterface';
import { NewableType } from '../types/NewableType';
import { HandlerConfig } from './ContainerInterfaces';
import { normalizeHandlerConfig } from '../helpers/normalizeHandlerConfig';

export class Container extends InversifyContainer {
  protected handlersRegistry: HandlerConfig[] = [];
  parent: Container | null;

  /**
   * Creates an instance of Container.
   * @param {interfaces.ContainerOptions} [containerOptions]
   * @memberof Container
   */
  constructor(containerOptions?: interfaces.ContainerOptions) {
    super({
      defaultScope: 'Singleton',
      autoBindInjectable: true,
      skipBaseClassChecks: true,
      ...containerOptions,
    });
  }

  /**
   * Get all registred handlers
   * @returns {HandlerConfig[]}
   * @memberof Container
   */
  getHandlers(): HandlerConfig[] {
    return [...this.handlersRegistry];
  }


  /**
   * Get a particular handler
   * @param {HandlerConfig} config
   * @returns {HandlerInterface}
   * @memberof Container
   */
  getHandler(config: HandlerConfig): HandlerInterface {
    const normalizedHandlerConfig = normalizeHandlerConfig(config);
    if (!('local' in normalizedHandlerConfig) || normalizedHandlerConfig.local === undefined) {
      normalizedHandlerConfig.local = true;
    }

    /*
      1. Try to get local or specific service:method
      2. Try to get local or specific service:*
      3. Try to get http service:method
      4. Try to get http service:*
    */

    let result = this.getHandlerFinal(normalizedHandlerConfig);
    if (result) {
      return result;
    }
    normalizedHandlerConfig.method = '*';
    result = this.getHandlerFinal(normalizedHandlerConfig);
    if (result) {
      return result;
    }
    if (!normalizedHandlerConfig.local) {
      return;
    }
    normalizedHandlerConfig.local = false;
    return this.getHandler(normalizedHandlerConfig);
  }

  /**
   * Get a particular handler or undefined if not known
   * @protected
   * @param {HandlerConfig} config
   * @returns {(HandlerInterface | undefined)}
   * @memberof Container
   */
  protected getHandlerFinal(config: HandlerConfig): HandlerInterface | undefined {
    const { containerSignature } = normalizeHandlerConfig(config);
    if (!containerSignature) {
      throw new Error('Oups');
    }

    if (this.isBound(containerSignature)) {
      return this.get(containerSignature);
    }
    return;
  }


  /**
   * Set an handler identified by config
   * @protected
   * @param {HandlerConfig} handlerConfig
   * @param {*} resolvedHandler
   * @returns
   * @memberof Container
   */
  protected setHandlerFinal(handlerConfig: HandlerConfig, resolvedHandler: any) {
    if (this.parent) {
      this.parent.setHandlerFinal(handlerConfig, resolvedHandler);
      return;
    }
    const normalizedHandlerConfig = normalizeHandlerConfig(handlerConfig);

    if (!normalizedHandlerConfig.containerSignature) {
      throw new Error('Oups');
    }
    this.handlersRegistry.push(normalizedHandlerConfig);
    this.bind<HandlerInterface>(normalizedHandlerConfig.containerSignature).toConstantValue(resolvedHandler);
  }


  /**
   * Set an handler
   * @param {NewableType<HandlerInterface>} handler
   * @memberof Container
   */
  setHandler(handler: NewableType<HandlerInterface>): HandlerInterface {
    const service = Reflect.getMetadata('rpc:service', handler);
    const method = Reflect.getMetadata('rpc:method', handler);
    const version = Reflect.getMetadata('rpc:version', handler);
    const local = Reflect.getMetadata('rpc:local', handler);
    const queue = Reflect.getMetadata('rpc:queue', handler);

    const handlerConfig = normalizeHandlerConfig({ service, method, version, local, queue });
    const resolvedHandler = this.get<HandlerInterface>(<any>handler);
    // TODO: throw error if not found
    // TODO: throw error if duplicate

    this.setHandlerFinal(handlerConfig, resolvedHandler);

    return resolvedHandler;
  }
}

export class ContainerModule extends InversifyContainerModule {}
