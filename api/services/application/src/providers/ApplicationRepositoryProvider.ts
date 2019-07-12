import { Container } from '@ilos/core';
import { ConfigInterfaceResolver } from '@ilos/config';
import { ParentRepository } from '@ilos/repository';
import { MongoConnection } from '@ilos/connection-mongo';

import { Application } from '../entities/Application';
import { ApplicationRepositoryProviderInterface, ApplicationRepositoryProviderInterfaceResolver } from '../interfaces';

@Container.provider({
  identifier: ApplicationRepositoryProviderInterfaceResolver,
})
export class ApplicationRepositoryProvider extends ParentRepository implements ApplicationRepositoryProviderInterface {
  constructor(protected config: ConfigInterfaceResolver, protected mongoProvider: MongoConnection) {
    super(config, mongoProvider);
  }

  public getKey(): string {
    return this.config.get('application.collectionName');
  }

  public getDbName(): string {
    return this.config.get('application.db');
  }

  public getModel() {
    return Application;
  }

  public async softDelete(params: { _id: string; operator_id: string }): Promise<any> {
    return this.patch(params._id, { deleted_at: new Date() });
  }
}
