import { Container } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { ParentRepositoryProvider } from '@ilos/provider-repository';
import { MongoProviderInterfaceResolver } from '@ilos/provider-mongo';

import { Territory } from '../entities/Territory';
import { TerritoryRepositoryProviderInterface } from '../interfaces/TerritoryRepositoryProviderInterface';

@Container.provider()
export class TerritoryRepositoryProvider extends ParentRepositoryProvider
  implements TerritoryRepositoryProviderInterface {
  constructor(
    protected config: ConfigProviderInterfaceResolver,
    protected mongoProvider: MongoProviderInterfaceResolver,
  ) {
    super(config, mongoProvider);
  }

  public getKey(): string {
    return this.config.get('territory.collectionName');
  }

  public getDatabase(): string {
    return this.config.get('mongo.db');
  }

  public getModel() {
    return Territory;
  }
}
