import { provider, ConfigInterfaceResolver } from '@ilos/common';
import { ParentRepository } from '@ilos/repository';
import { MongoConnection, ObjectId } from '@ilos/connection-mongo';

import { Application } from '../entities/Application';
import { ApplicationRepositoryProviderInterface, ApplicationRepositoryProviderInterfaceResolver } from '../interfaces';

@provider({
  identifier: ApplicationRepositoryProviderInterfaceResolver,
})
export class ApplicationRepositoryProvider extends ParentRepository implements ApplicationRepositoryProviderInterface {
  castObjectIds = ['operator_id'];

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

  public async allByOperator({ operator_id }): Promise<Application[]> {
    const collection = await this.getCollection();
    const results = await collection.find({ operator_id: new ObjectId(operator_id) }).toArray();

    return this.instanciateMany(results);
  }

  public async softDelete(params: { _id: string; operator_id: string }): Promise<any> {
    return this.patch(params._id, { deletedAt: new Date() });
  }
}
