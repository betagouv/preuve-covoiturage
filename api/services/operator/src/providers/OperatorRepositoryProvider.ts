import { ConfigInterfaceResolver, provider } from '@ilos/common';
import { MongoConnection } from '@ilos/connection-mongo';
import { ParentRepository } from '@ilos/repository';

import { Operator } from '../entities/Operator';
import {
  OperatorRepositoryProviderInterface,
  OperatorRepositoryProviderInterfaceResolver,
} from '../interfaces/OperatorRepositoryProviderInterface';

@provider({
  identifier: OperatorRepositoryProviderInterfaceResolver,
})
export class OperatorRepositoryProvider extends ParentRepository implements OperatorRepositoryProviderInterface {
  constructor(protected config: ConfigInterfaceResolver, protected mongoProvider: MongoConnection) {
    super(config, mongoProvider);
  }

  public getKey(): string {
    return this.config.get('operator.collectionName');
  }

  public getDbName(): string {
    return this.config.get('operator.db');
  }

  public getModel() {
    return Operator;
  }
}
