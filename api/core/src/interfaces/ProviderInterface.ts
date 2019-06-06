import { ContainerModuleConfigurator } from '../container';

export interface ProviderInterface {
  /**
   * Boot is the first method called after constructor
   */
  boot(): Promise<void> | void;

  /**
   * Declare a container module
   */
  register?(module: ContainerModuleConfigurator): Promise<void> | void;
}
