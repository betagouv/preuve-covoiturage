import { ContainerInterface } from '../container';

import { ProviderInterface } from './ProviderInterface';
import { NewableType } from '../types/NewableType';
import { MiddlewareInterface } from './MiddlewareInterface';

export interface ServiceProviderInterface extends ProviderInterface {
  /**
   * Alias is a shortcut to registrer bindings
   */
  readonly alias: any[];

  /**
   * Middlewares is a shortcut to registrer middlewares
   */
  readonly middlewares?: [string, NewableType<MiddlewareInterface>][];

  /**
   * List of Service providers constructor
   */
  readonly serviceProviders: NewableType<ServiceProviderInterface>[];

  /**
   * Get the container
   */
  getContainer(): ContainerInterface;
}
