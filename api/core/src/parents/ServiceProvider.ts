import {
  ContainerModule,
  ContainerModuleConfigurator,
  Container,
  ContainerInterface,
  Bind,
  Unbind,
  IsBound,
  Rebind,
} from '../container';

import { HandlerInterface } from '../interfaces/HandlerInterface';

import { ServiceProviderInterface } from '../interfaces/ServiceProviderInterface';
import { NewableType } from '../types/NewableType';
import { ClassMiddlewareInterface } from '../interfaces/ClassMiddlewareInterface';

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
  readonly middlewares: [string, NewableType<ClassMiddlewareInterface>][] = [];

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
    this.getContainer().load(
      new ContainerModule(
        (bind: Bind, unbind: Unbind, isBound: IsBound, rebind: Rebind) => {
          this.register({ bind, unbind, isBound, rebind });
          this.middlewares.forEach(([name, middleware]) => {
            bind(name).to(middleware);
          });
        },
      ),
    );

    for (const serviceProviderConstructor of this.serviceProviders) {
      await this.registerServiceProvider(serviceProviderConstructor);
    }

    for (const handler of this.handlers) {
      const handlerInstance = this.getContainer().setHandler(handler);
      await handlerInstance.boot(this.getContainer());
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

  // TODO: add to interface
  public async registerServiceProvider(serviceProviderConstructor: NewableType<ServiceProviderInterface>) {
    const serviceProvider = new serviceProviderConstructor(this.getContainer());
    await serviceProvider.boot();
  }
}
