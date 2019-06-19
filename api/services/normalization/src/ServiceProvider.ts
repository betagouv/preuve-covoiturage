import { Parents, Interfaces, Types } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';


export class ServiceProvider extends Parents.ServiceProvider implements Interfaces.ServiceProviderInterface {
  readonly alias = [
  ];

  readonly handlers: Types.NewableType<Interfaces.HandlerInterface>[] = [
    NormalizationProcessAction,
  ];

  readonly middlewares: [string, Types.NewableType<Interfaces.MiddlewareInterface>][] = [
  ];

  protected readonly validators: [string, any][] = [
  ];

  public async boot() {
    await super.boot();
    this.registerConfig();
  }

  protected registerConfig() {
    this.getContainer()
      .get(ConfigProviderInterfaceResolver)
      .loadConfigDirectory(__dirname);
  }
}
