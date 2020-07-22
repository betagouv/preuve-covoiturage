import { get, has } from 'lodash';
import { ConfigInterfaceResolver, RegisterHookInterface, ServiceContainerInterface, extension } from '@ilos/common';

export class ConfigStore {
  constructor(protected config: { [k: string]: any }) {}

  get(key: string, fallback?: any): any {
    if (fallback === undefined && !has(this.config, key)) {
      throw new Error(`Unknown config key '${key}'`);
    }

    return get(this.config, key, fallback);
  }
}

@extension({
  name: 'config',
  autoload: true,
})
export class Config implements RegisterHookInterface {
  constructor(protected readonly params: { [k: string]: any } = {}) {}

  async register(serviceContainer: ServiceContainerInterface) {
    serviceContainer
      .getContainer()
      .bind(ConfigInterfaceResolver)
      .toConstantValue(new ConfigStore(this.params));
  }
}
