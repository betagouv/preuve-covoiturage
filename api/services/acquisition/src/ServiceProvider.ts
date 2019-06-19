import { Parents, Interfaces } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';

import { CreateJourneyAction } from './actions/CreateJourneyAction';

export class ServiceProvider extends Parents.ServiceProvider implements Interfaces.ServiceProviderInterface {
  readonly alias = [];

  handlers = [CreateJourneyAction];

  public async boot() {
    this.getContainer()
      .get(ConfigProviderInterfaceResolver)
      .loadConfigDirectory(__dirname);
    await super.boot();
  }
}
