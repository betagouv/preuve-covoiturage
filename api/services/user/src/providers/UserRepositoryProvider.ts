import { Providers, Container } from '@pdc/core';
import { ParentRepositoryProvider } from '@pdc/provider-repository';
import { MongoProvider, ObjectId } from '@pdc/provider-mongo';

import { userSchema } from '../entities/userSchema';
import { User } from '../entities/User';
import { UserRepositoryProviderInterface } from '../interfaces/UserRepositoryProviderInterface';

@Container.provider()
export class UserRepositoryProvider extends ParentRepositoryProvider implements UserRepositoryProviderInterface{
  constructor(
    protected config: Providers.ConfigProvider,
    protected mongoProvider: MongoProvider,
  ) {
    super(config, mongoProvider);
  }

  public getKey(): string {
    return this.config.get('user.collectionName');
  }

  public getDatabase(): string {
    return this.config.get('mongo.db');
  }

  public getSchema(): object | null {
    return userSchema;
  }

  public getModel() {
    return User;
  }

  public async findByEmail(email: string): Promise<User> {
    console.log('email : ', email);
    const collection = await this.getCollection();
    console.log('?');
    const result = await collection.findOne({ email });
    console.log('result', result);
    return this.instanciate(result);
  }

  public async list(filters, pagination): Promise<{users: User[], total: number}> {
    let result = [];

    // todo: get skip and limit from pagination
    const collection = await this.getCollection();

    // filters aom : string, operator: string
    if (filters.aom) {
      result = await collection.find({ aom: ObjectId(filters.aom) }).toArray();
    } else if (filters.operator) {
      result = await collection.find({ operator: ObjectId(filters.operator) }).toArray();
    }

    result = await collection.find(filters).toArray();

    const users = this.instanciateMany(result);
    const total = 100; // todo : get total;

    return {
      users,
      total,
    };
  }
}
