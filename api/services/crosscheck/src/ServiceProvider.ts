import { Parents, Interfaces, Types } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { GeoProvider, GeoProviderInterfaceResolver } from '@pdc/provider-geo';

import { CrosscheckProcessAction } from './actions/CrosscheckProcessAction';


export class ServiceProvider extends Parents.ServiceProvider implements Interfaces.ServiceProviderInterface {
  readonly alias = [
  ];

  readonly handlers: Types.NewableType<Interfaces.HandlerInterface>[] = [
    CrosscheckProcessAction,
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
