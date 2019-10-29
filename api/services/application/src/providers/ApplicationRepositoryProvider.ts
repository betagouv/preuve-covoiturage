import { provider, ConfigInterfaceResolver } from '@ilos/common';
import { ParentRepository } from '@ilos/repository';
import { MongoConnection, ObjectId } from '@ilos/connection-mongo';

import { ApplicationInterface } from '../shared/application/common/interfaces/ApplicationInterface';
import {
  ApplicationRepositoryProviderInterface,
  ApplicationRepositoryProviderInterfaceResolver,
} from '../interfaces/ApplicationRepositoryProviderInterface';

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

  public async allByOperator({ operator_id }): Promise<ApplicationInterface[]> {
    const collection = await this.getCollection();
    const results = await collection.find({ operator_id: new ObjectId(operator_id), deleted_at: null }).toArray();

    return this.instanciateMany(results);
  }

  public async softDelete(params: { _id: string; operator_id: string }): Promise<boolean> {
    const driver = await this.getDriver();
    const query: any = { _id: new ObjectId(params._id), deleted_at: null };

    if ('operator_id' in params && params.operator_id) {
      query.operator_id = new ObjectId(params.operator_id);
    }

    const res = await driver.updateOne(query, { $set: { deleted_at: new Date() } });

    return res.result.nModified > 0;
  }
}
