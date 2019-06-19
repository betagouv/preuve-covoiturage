import { Container } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { ParentRepositoryProvider } from '@ilos/provider-repository';
import { MongoException, MongoProviderInterfaceResolver } from '@ilos/provider-mongo';

import { Journey } from '../entities/Journey';
import { JourneyRepositoryProviderInterface } from '../interfaces/JourneyRepositoryProviderInterface';

@Container.provider()
export class JourneyRepositoryProvider extends ParentRepositoryProvider implements JourneyRepositoryProviderInterface {
  constructor(
    protected config: ConfigProviderInterfaceResolver,
    protected mongoProvider: MongoProviderInterfaceResolver,
  ) {
    super(config, mongoProvider);
  }

  public getKey(): string {
    return this.config.get('aquisition.collectionName', 'journeys');
  }

  public getDatabase(): string {
    return this.config.get('aquisition.db');
  }

  public getModel() {
    return Journey;
  }

  async createMany(journeys: Journey[]): Promise<Journey[]> {
    const collection = await this.getCollection();
    const { result, ops } = await collection.insertMany(journeys);

    if (result.ok !== 1) {
      throw new MongoException();
    }

    return this.instanciateMany(ops);
  }
}
