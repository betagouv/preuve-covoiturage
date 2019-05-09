import { ContainerModuleConfigurator, ContainerInterface } from '../container';

export interface ProviderInterface {

  /**
   * Boot is the first method called after constructor
   * @param {ContainerInterface} [container]
   * @returns {(Promise<void> | void)}
   * @memberof ProviderInterface
   */
  boot(container?: ContainerInterface): Promise<void> | void;


  /**
   * Declare a container module
   * @param {ContainerModuleConfigurator} module
   * @returns {(Promise<void> | void)}
   * @memberof ProviderInterface
   */
  register?(module: ContainerModuleConfigurator): Promise<void> | void;
}
