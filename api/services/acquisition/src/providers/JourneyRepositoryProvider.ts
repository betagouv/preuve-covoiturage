import { ConfigInterfaceResolver, provider } from '@ilos/common';
import { ParentRepository } from '@ilos/repository';
import { MongoException, MongoConnection } from '@ilos/connection-mongo';

import { Journey } from '../entities/Journey';
import { JourneyRepositoryProviderInterface, JourneyRepositoryProviderInterfaceResolver } from '../interfaces/JourneyRepositoryProviderInterface';

@provider({
  identifier: JourneyRepositoryProviderInterfaceResolver,
})
export class JourneyRepositoryProvider extends ParentRepository implements JourneyRepositoryProviderInterface {
  constructor(
    protected config: ConfigInterfaceResolver,
    protected connection: MongoConnection,
  ) {
    super(config, connection);
  }

  public getKey(): string {
    return this.config.get('acquisition.collectionName', 'journeys');
  }

  public getDbName(): string {
    return this.config.get('acquisition.db');
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
