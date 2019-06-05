import { Parents, Providers, Interfaces } from '@pdc/core';

import { CreateJourneyAction } from './actions/CreateJourneyAction';

export class ServiceProvider extends Parents.ServiceProvider implements Interfaces.ServiceProviderInterface {
  readonly alias = [
  ];

  handlers = [
    CreateJourneyAction,
  ];

  public async boot() {
    this.getContainer().get(Providers.ConfigProvider).loadConfigDirectory(__dirname);
    await super.boot();
  }
}
