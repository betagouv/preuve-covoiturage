import { ProviderInterface } from '../index.ts';

export interface ConfigInterface extends ProviderInterface {
  get<T = any>(key: string, fallback?: T): T;
}

export abstract class ConfigInterfaceResolver implements ConfigInterface {
  get<T = any>(key: string, fallback?: T): T {
    throw new Error();
  }
}
