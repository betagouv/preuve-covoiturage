import _ from 'lodash';
import { extension, ConfigInterfaceResolver } from '@ilos/common/index.ts';
import type { RegisterHookInterface, ServiceContainerInterface } from '@ilos/common/index.ts';

export class ConfigStore extends ConfigInterfaceResolver {
  constructor(protected config: { [k: string]: any }) {
    super();
  }

  get(key: string, fallback?: any): any {
    if (fallback === undefined && !_.has(this.config, key)) {
      throw new Error(`Unknown config key '${key}'`);
    }

    return _.get(this.config, key, fallback);
  }
}

@extension({
  name: 'config',
  autoload: true,
})
export class Config implements RegisterHookInterface {
  constructor(protected readonly params: { [k: string]: any } = {}) {}

  async register(serviceContainer: ServiceContainerInterface) {
    serviceContainer.getContainer().bind(ConfigInterfaceResolver).toConstantValue(new ConfigStore(this.params));
  }
}
