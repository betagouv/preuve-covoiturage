import {
  ContainerModule,
  ContainerModuleConfigurator,
  Container,
  ContainerInterface,
  Bind,
  Unbind,
  IsBound,
  Rebind,
} from '~/Container';

import { HandlerInterface } from '~/interfaces/HandlerInterface';

import { ServiceProviderInterface } from '../interfaces/ServiceProviderInterface';
import { NewableType } from '../types/NewableType';

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

  public getContainer():ContainerInterface {
    return this.container;
  }
}
