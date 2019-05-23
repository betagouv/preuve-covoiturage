import { Providers, Container } from '@pdc/core';
import { ParentRepositoryProvider } from '@pdc/provider-repository';
import { MongoProvider } from '@pdc/provider-mongo';
import { Aom } from '../entities/Aom';
import { AomRepositoryProviderInterface } from '../interfaces/AomRepositoryProviderInterface';

@Container.provider()
export class AomRepositoryProvider extends ParentRepositoryProvider implements AomRepositoryProviderInterface {
  constructor(
    protected config: Providers.ConfigProvider,
    protected mongoProvider: MongoProvider,
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
