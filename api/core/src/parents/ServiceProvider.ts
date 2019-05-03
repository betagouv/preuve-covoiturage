import {
  ContainerModule,
  ContainerModuleConfigurator,
  Container,
  ContainerInterface,
  Bind,
  Unbind,
  IsBound,
  Rebind,
} from '../Container';

import { HandlerInterface } from '../interfaces/HandlerInterface';

import { ServiceProviderInterface } from '../interfaces/ServiceProviderInterface';
import { NewableType } from '../types/NewableType';

/**
 * Service provider parent class
 * @export
 * @abstract
 * @class ServiceProvider
 * @implements {ServiceProviderInterface}
 */
export abstract class ServiceProvider implements ServiceProviderInterface {
  readonly alias: any[] = [];
  readonly serviceProviders: NewableType<ServiceProviderInterface>[] = [];

  readonly handlers: NewableType<HandlerInterface>[] = [];
  protected container: ContainerInterface;

  constructor(container?: ContainerInterface) {
    this.container = new Container();
    if (container) {
      this.container.parent = container;
    }
  }

  /**
   * Boot register a container module provided by register function,
   * then register the handlers, then boot other service providers
   * @memberof ServiceProvider
   */
  public async boot() {
    this.container.load(
      new ContainerModule(
        (bind: Bind, unbind: Unbind, isBound: IsBound, rebind: Rebind) => this.register({ bind, unbind, isBound, rebind }),
      ),
    );

    this.handlers.forEach((handler) => {
      this.getContainer().setHandler(handler);
    });

    for (const serviceProviderConstructor of this.serviceProviders) {
      const serviceProvider = new serviceProviderConstructor(this.getContainer());
      await serviceProvider.boot();
    }
  }

  /**
   * Auto bind alias
   * @param {ContainerModuleConfigurator} module
   * @memberof ServiceProvider
   */
  public register(module: ContainerModuleConfigurator):void {
    this.alias.forEach((def) => {
      if (Array.isArray(def)) {
        const [target, alias] = def;
        module.bind(alias).to(target);
      } else {
        module.bind(def).toSelf();
      }
    });
  }

  /**
   * Return the container
   * @returns {ContainerInterface}
   * @memberof ServiceProvider
   */
  public getContainer():ContainerInterface {
    return this.container;
  }
}
