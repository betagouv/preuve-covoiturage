import { ContainerInterface } from '../Container';

import { ProviderInterface } from './ProviderInterface';
import { NewableType } from '../types/NewableType';

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
