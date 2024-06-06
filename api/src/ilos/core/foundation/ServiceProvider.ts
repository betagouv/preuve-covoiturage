import { NewableType, ExtensionInterface } from '/ilos/common/index.ts';

import { ServiceContainer } from './ServiceContainer.ts';
import { Providers, Middlewares, Handlers, Config } from '../extensions/index.ts';

/**
 * Service provider parent class
 * @export
 * @abstract
 * @class ServiceProvider
 * @implements {ServiceProviderInterface}
 */
export abstract class ServiceProvider extends ServiceContainer {
  readonly extensions: NewableType<ExtensionInterface>[] = [Config, Middlewares, Providers, Handlers];
}
