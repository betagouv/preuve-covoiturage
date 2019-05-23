import { ContainerInterface } from '../container';

import { ProviderInterface } from './ProviderInterface';
import { NewableType } from '../types/NewableType';
import { ClassMiddlewareInterface } from './ClassMiddlewareInterface';

export interface ServiceProviderInterface extends ProviderInterface {

  /**
   * Alias is a shortcut to registrer bindings
   * @example [MyCustomService] will bind MyCustomService to self
   * @example [['custom', MyCustomService]] will bind 'custom' to MyCustomService
   * @type {any[]}
   * @memberof ServiceProviderInterface
   */
  readonly alias: any[];

    /**
   * Middlewares is a shortcut to registrer middlewares
   * @example [['can', CanMiddleware]] will bind 'can' to CanMiddleware
   * @type {[string, NewableType<ClassMiddlewareInterface>][]}
   * @memberof ServiceProviderInterface
   */
  readonly middlewares?: [string, NewableType<ClassMiddlewareInterface>][];

  /**
   * List of Service providers constructor
   * @type {NewableType<ServiceProviderInterface>[]}
   * @memberof ServiceProviderInterface
   */
  readonly serviceProviders: NewableType<ServiceProviderInterface>[];


  /**
   * Get the container
   * @returns {ContainerInterface}
   * @memberof ServiceProviderInterface
   */
  getContainer():ContainerInterface;
}
