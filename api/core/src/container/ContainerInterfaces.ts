/* tslint:disable:no-empty-interface */

import { interfaces } from 'inversify';

import { HandlerInterface } from '../interfaces/HandlerInterface';
import { NewableType } from '../types/NewableType';

export type HandlerConfig = {
  service?: string;
  method?: string;
  version?: string;
  local?: boolean;
  queue?: boolean;
  signature?: string;
  containerSignature?: string;
};

export interface ContainerInterface extends interfaces.Container {
  setHandler(handler: NewableType<HandlerInterface>): HandlerInterface;
  getHandler(config: HandlerConfig): HandlerInterface;
  getHandlers(): HandlerConfig[];
}

export interface Bind extends interfaces.Bind {}
export interface Unbind extends interfaces.Unbind {}
export interface IsBound extends interfaces.IsBound {}
export interface Rebind extends interfaces.Rebind {}

export interface ContainerModuleConfigurator {
  bind: Bind;
  unbind: Unbind;
  isBound: IsBound;
  rebind: Rebind;
}
