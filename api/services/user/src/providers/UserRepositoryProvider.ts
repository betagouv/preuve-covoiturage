import { Interfaces, Providers, Container } from '@pdc/core';
import { ParentRepositoryProvider } from '@pdc/provider-repository';
import { JsonSchemaProvider } from '@pdc/provider-jsonschema';
import { MongoProvider } from '@pdc/provider-mongo';
import { userSchema } from '../entities/userSchema';
import { User } from '../entities/User';

@Container.provider()
export class UserRepositoryProvider extends ParentRepositoryProvider {
  constructor(
    protected config: Providers.ConfigProvider,
    protected jsonSchemaProvider: JsonSchemaProvider,
    protected mongoProvider: MongoProvider,
  ) {
    super(config, jsonSchemaProvider, mongoProvider);
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
}
