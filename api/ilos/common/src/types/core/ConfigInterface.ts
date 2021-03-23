import { ProviderInterface } from '.';

export interface ConfigInterface extends ProviderInterface {
  get<P = any>(key: string, fallback?: P): P;
}

export abstract class ConfigInterfaceResolver implements ConfigInterface {
  get<P = any>(key: string, fallback?: P): P {
    throw new Error();
  }
}
