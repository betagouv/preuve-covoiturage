import { Providers, Container } from '@pdc/core';
import { ParentRepositoryProvider } from '@pdc/provider-repository';
import { MongoProvider } from '@pdc/provider-mongo';
import { Journey } from '../entities/Journey';
import { JourneyRepositoryProviderInterface } from '../interfaces/JourneyRepositoryProviderInterface';

@Container.provider()
export class JourneyRepositoryProvider extends ParentRepositoryProvider implements JourneyRepositoryProviderInterface {
  constructor(
    protected config: Providers.ConfigProvider,
    protected mongoProvider: MongoProvider,
  ) {
    super(config, mongoProvider);
  }

  public getKey(): string {
    return this.config.get('aquisition.collectionName');
  }

  public getDatabase(): string {
    return this.config.get('aquisition.db');
  }

  public getModel() {
    return Journey;
  }
}
