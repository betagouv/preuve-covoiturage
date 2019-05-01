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

  constructor(containerOptions?: interfaces.ContainerOptions) {
    super({
      defaultScope: 'Singleton',
      autoBindInjectable: true,
      skipBaseClassChecks: true,
      ...containerOptions,
    });
  }

  getHandlers(): HandlerConfig[] {
    return [...this.handlersRegistry];
  }

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

  protected getHandlerFinal(config: HandlerConfig): HandlerInterface | undefined {
    const { service, method, version, transport } = config;
    const signature = `HandlerInterface/${resolveMethodFromObject({ service, method, version })}/${transport}`;
    if (this.isBound(signature)) {
      return this.get(signature);
    }
    return;
  }

  protected setHandlerFinal(handlerConfig: HandlerConfig, resolvedHandler: any) {
    if (this.parent) {
      this.parent.setHandlerFinal(handlerConfig, resolvedHandler);
      return;
    }
    const { service, method, version, transport, signature } = handlerConfig;

    this.handlersRegistry.push({ service, method, version, transport, signature });
    this.bind<HandlerInterface>(signature).toConstantValue(resolvedHandler);
  }

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
