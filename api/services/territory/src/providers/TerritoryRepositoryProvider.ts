import { Container } from '@ilos/core';
import { ConfigInterfaceResolver } from '@ilos/config';
import { ParentRepository } from '@ilos/repository';
import { MongoConnection } from '@ilos/connection-mongo';

import { Territory } from '../entities/Territory';
import {
  TerritoryRepositoryProviderInterface,
  TerritoryRepositoryProviderInterfaceResolver,
} from '../interfaces/TerritoryRepositoryProviderInterface';

@Container.provider({
  identifier: TerritoryRepositoryProviderInterfaceResolver,
})
export class TerritoryRepositoryProvider extends ParentRepository
  implements TerritoryRepositoryProviderInterface {
  constructor(
    protected config: ConfigInterfaceResolver,
    protected mongoProvider: MongoConnection,
  ) {
    super(config, mongoProvider);
  }

  public getKey(): string {
    return this.config.get('territory.collectionName');
  }

  public getDbName(): string {
    return this.config.get('territory.db');
  }

  public getModel() {
    return Territory;
  }
}
