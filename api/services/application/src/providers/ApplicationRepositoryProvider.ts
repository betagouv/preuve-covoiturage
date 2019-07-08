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

  public getDatabase(): string {
    return this.config.get('application.db');
  }

  public getModel() {
    return Application;
  }

  public async check(params: { _id: string; operatorId: string }): Promise<boolean> {
    // TODO check with _id and operatorId if the app is in the DB
    throw new Error('TODO');
  }

  public async softDelete(params: { _id: string; operatorId: string }): Promise<any> {
    // TODO patch the doc with delete_at = now()
    throw new Error('TODO');
  }
}
