import { Providers, Container } from '@pdc/core';
import { ParentRepositoryProvider } from '@pdc/provider-repository';
import { MongoProvider } from '@pdc/provider-mongo';

import { Operator } from '../entities/Operator';
import { OperatorRepositoryProviderInterface } from '../interfaces/OperatorRepositoryProviderInterface';

@Container.provider()
export class OperatorRepositoryProvider extends ParentRepositoryProvider
  implements OperatorRepositoryProviderInterface {
  constructor(protected config: Providers.ConfigProvider, protected mongoProvider: MongoProvider) {
    super(config, mongoProvider);
  }

  public getKey(): string {
    return this.config.get('operator.collectionName');
  }

  public getDatabase(): string {
    return this.config.get('mongo.db');
  }

  public getModel() {
    return Operator;
  }
}
