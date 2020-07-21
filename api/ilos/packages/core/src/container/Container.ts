import 'reflect-metadata';
import { Container as InversifyContainer, interfaces } from 'inversify';

import {
  FunctionalHandlerInterface,
  HandlerInterface,
  NewableType,
  HandlerConfigType,
  ContainerInterface,
  ParamsType,
  ContextType,
  ResultType,
} from '@ilos/common';

import { HandlerRegistry } from './HandlerRegistry';

export class Container extends InversifyContainer implements ContainerInterface {
  protected handlersRegistry: HandlerRegistry = new HandlerRegistry(this);
  parent: Container | null;

  get root(): Container {
    if (this.parent) {
      return this.parent.root;
    }
    return this;
  }

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

  createChild(containerOptions: interfaces.ContainerOptions = {}): Container {
    const container = new Container(containerOptions);
    container.parent = this;
    return container;
  }

  setHandler(handler: NewableType<HandlerInterface>) {
    return this.handlersRegistry.set(handler);
  }

  getHandler<P = ParamsType, C = ContextType, R = ResultType>(
    config: HandlerConfigType,
  ): FunctionalHandlerInterface<P, C, R> {
    return this.handlersRegistry.get<P, C, R>(config);
  }

  getHandlers(): (HandlerConfigType & { resolver: Function })[] {
    return this.handlersRegistry.all();
  }
}
