import { ProviderInterface } from '../core';

import { LogMessageType } from './LogMessageType';

export interface LoggerInterface extends ProviderInterface {
  debug(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  log(message: LogMessageType): void;
  profile(id: string | number, meta?: LogMessageType): void;
}

export interface LoggerDriverInterface {
  log(level: string, message: string, meta: any): void;
}

export abstract class LoggerInterfaceResolver implements LoggerInterface {
  debug(message: string, meta?: any): void {
    throw new Error();
  }
  info(message: string, meta?: any): void {
    throw new Error();
  }
  warn(message: string, meta?: any): void {
    throw new Error();
  }
  error(message: string, meta?: any): void {
    throw new Error();
  }
  log(message: LogMessageType): void {
    throw new Error();
  }
  profile(id: string | number, meta?: LogMessageType) {
    throw new Error();
  }
}
