import type { Factory, ContainerOptions, ContainerInterface as InversifyContainerInterface } from '@/deps.ts';

import { NewableType } from '../shared/index.ts';
import { HandlerInterface, HandlerConfigType, FunctionalHandlerInterface } from '../handler/index.ts';
import { ParamsType, ContextType, ResultType } from '../call/index.ts';

export interface ContainerInterface extends InversifyContainerInterface {
  root: ContainerInterface;
  setHandler(handler: NewableType<HandlerInterface>): void;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getHandler<P = ParamsType, C = ContextType, R = ResultType>(config: HandlerConfigType): FunctionalHandlerInterface;
  getHandlers(): (HandlerConfigType & { resolver: Function })[];
  createChild(containerOptions?: ContainerOptions): ContainerInterface;
}

export type { Factory };
