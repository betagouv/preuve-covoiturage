import { Container } from '@ilos/core';
import { ConfigProviderInterfaceResolver } from '@ilos/provider-config';
import { MongoProviderInterfaceResolver } from '@ilos/provider-mongo';
import { ParentRepositoryProvider } from '@ilos/provider-repository';

import { Operator } from '../entities/Operator';
import { OperatorRepositoryProviderInterface } from '../interfaces/OperatorRepositoryProviderInterface';

@Container.provider()
export class OperatorRepositoryProvider extends ParentRepositoryProvider
  implements OperatorRepositoryProviderInterface {
  constructor(
    protected config: ConfigProviderInterfaceResolver,
    protected mongoProvider: MongoProviderInterfaceResolver,
  ) {
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
