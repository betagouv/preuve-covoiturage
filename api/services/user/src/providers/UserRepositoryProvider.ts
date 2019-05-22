import { Providers, Container } from '@pdc/core';
import { ParentRepositoryProvider } from '@pdc/provider-repository';
import { MongoProvider } from '@pdc/provider-mongo';
import { userSchema } from '../entities/userSchema';
import { User } from '../entities/User';
import { UserRepositoryProviderInterface } from '../interfaces/UserRepositoryProviderInterface';
import { Model } from '@pdc/provider-repository/dist/ParentRepositoryProviderInterface';

@Container.provider()
export class UserRepositoryProvider extends ParentRepositoryProvider implements UserRepositoryProviderInterface{
  constructor(
    protected config: Providers.ConfigProvider,
    protected mongoProvider: MongoProvider,
  ) {
    super(config, mongoProvider);
  }

  public getKey(): string {
    return 'user';
  }

  public getDatabase(): string {
    return 'test';
  }

  public getSchema(): object | null {
    return userSchema;
  }

  public getModel() {
    return User;
  }

  public async findByEmail(email: string): Promise<Model>  {
    const collection = await this.getCollection();
    const result = await collection.findOne({ email });
    return this.instanciate(result);
  }

  public async list(filters, pagination): Promise<Model> {
    // todo: get skip and limit from pagination
    const collection = await this.getCollection();
    const result = await collection.find(filters).toArray();

    // todo: update pagination metadata from request
    return this.instanciate(result);
  }
}
