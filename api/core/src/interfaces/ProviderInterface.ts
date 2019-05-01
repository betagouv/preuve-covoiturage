import { ContainerModuleConfigurator, ContainerInterface } from '../Container';

export interface ProviderInterface {
  boot(container?: ContainerInterface): Promise<void> | void;
  register?(module: ContainerModuleConfigurator): Promise<void> | void;
}
