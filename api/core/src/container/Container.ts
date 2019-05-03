import 'reflect-metadata';
import {
  Container as InversifyContainer,
  ContainerModule as InversifyContainerModule,
  interfaces,
} from 'inversify';

import { HandlerInterface } from '~/interfaces/HandlerInterface';
import { NewableType } from '~/types/NewableType';
import { resolveMethodFromObject } from '~/helpers/resolveMethod';

import { HandlerConfig } from './ContainerInterfaces';

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
    const { service, method } = config;
    if (!method || !service) {
      throw new Error('Unable to resolve service: missing param');
    }
    let { version, transport } = config;

    version = version ? version : 'latest';
    transport = transport ? transport : 'local';

    /*
      1. Try to get local or specific service:method
      2. Try to get local or specific service:*
      3. Try to get http service:method
      4. Try to get http service:*
    */

    let result = this.getHandlerFinal({ method, version, transport, service });
    if (result) {
      return result;
    }
    result = this.getHandlerFinal({ version, transport, service, method: '*' });
    if (result) {
      return result;
    }
    if (transport === 'http') {
      return;
    }
    return this.getHandler({ method, version, service, transport: 'http' });
  }

  /**
   * Get a particular handler or undefined if not known
   * @protected
   * @param {HandlerConfig} config
   * @returns {(HandlerInterface | undefined)}
   * @memberof Container
   */
  protected getHandlerFinal(config: HandlerConfig): HandlerInterface | undefined {
    const { service, method, version, transport } = config;
    const signature = `HandlerInterface/${resolveMethodFromObject({ service, method, version })}/${transport}`;
    if (this.isBound(signature)) {
      return this.get(signature);
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
    const { service, method, version, transport, signature } = handlerConfig;

    this.handlersRegistry.push({ service, method, version, transport, signature });
    this.bind<HandlerInterface>(signature).toConstantValue(resolvedHandler);
  }


  /**
   * Set an handler
   * @param {NewableType<HandlerInterface>} handler
   * @memberof Container
   */
  setHandler(handler: NewableType<HandlerInterface>) {
    const service = Reflect.getMetadata('rpc:service', handler);
    const method = Reflect.getMetadata('rpc:method', handler);
    const version = Reflect.getMetadata('rpc:version', handler);
    const transport = Reflect.getMetadata('rpc:transport', handler);
    if (!service) {
      throw new Error('You must provide a service name');
    }
    const resolvedHandler = this.get<HandlerInterface>(<any>handler);
    // throw error if not found
    // throw error if duplicate
    const signature = `HandlerInterface/${resolveMethodFromObject({ service, method, version })}/${transport}`;

    this.setHandlerFinal({ service, method, version, transport, signature }, resolvedHandler);
  }
}

export class ContainerModule extends InversifyContainerModule {}
