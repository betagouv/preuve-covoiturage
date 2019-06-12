import { Container } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { ParentRepositoryProvider } from '@ilos/provider-repository';
import { MongoProviderInterfaceResolver } from '@ilos/provider-mongo';

import { Aom } from '../entities/Aom';
import { AomRepositoryProviderInterface } from '../interfaces/AomRepositoryProviderInterface';

@Container.provider()
export class AomRepositoryProvider extends ParentRepositoryProvider implements AomRepositoryProviderInterface {
  constructor(
    protected config: ConfigProviderInterfaceResolver,
    protected mongoProvider: MongoProviderInterfaceResolver,
  ) {
    super(config, mongoProvider);
  }

  public getKey(): string {
    return this.config.get('aom.collectionName');
  }

  public getDatabase(): string {
    return this.config.get('mongo.db');
  }

  public getModel() {
    return Aom;
  }
}
