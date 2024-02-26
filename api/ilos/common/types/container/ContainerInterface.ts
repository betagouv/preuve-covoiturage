import { interfaces } from 'inversify';

import { NewableType } from '../shared';
import { HandlerInterface, HandlerConfigType, FunctionalHandlerInterface } from '../handler';
import { ParamsType, ContextType, ResultType } from '../call';

export interface ContainerInterface extends interfaces.Container {
  root: ContainerInterface;
  setHandler(handler: NewableType<HandlerInterface>): void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getHandler<P = ParamsType, C = ContextType, R = ResultType>(config: HandlerConfigType): FunctionalHandlerInterface;
  getHandlers(): (HandlerConfigType & { resolver: Function })[];
  createChild(containerOptions?: interfaces.ContainerOptions): ContainerInterface;
}

/* eslint-disable @typescript-eslint/no-empty-interface */
export interface Factory<T> extends interfaces.Factory<T> {}
