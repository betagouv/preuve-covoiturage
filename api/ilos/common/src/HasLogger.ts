// tslint:disable no-console
import { injectable, inject } from './Decorators';
import { LoggerInterface, LogMessageType } from './types/logger';

export const CONTAINER_LOGGER_KEY = Symbol.for('logger');
@injectable()
export class DefaultLogger implements LoggerInterface {
  protected profiles: Map<string, number> = new Map();

  debug(message: string, meta?: any): void {
    console.debug({ message, meta });
  }
  info(message: string, meta?: any): void {
    console.info({ message, meta });
  }
  warn(message: string, meta?: any): void {
    console.warn({ message, meta });
  }
  error(message: string, meta?: any): void {
    console.error({ message, meta });
  }

  profile(message: string, meta?: any): void {
    if (this.profiles.has(message)) {
      const duration = Date.now() - this.profiles.get(message);
      this.log({
        message,
        duration,
        level: 'info',
        ...meta,
      });
      this.profiles.delete(message);
      return;
    }
    this.profiles.set(message, Date.now());
  }

  log(message: LogMessageType): void {
    console.log(message);
  }
}

export abstract class HasLogger {
  @inject(CONTAINER_LOGGER_KEY)
  protected logger: LoggerInterface = new DefaultLogger();
}
