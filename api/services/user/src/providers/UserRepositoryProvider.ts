import { Interfaces, Providers, Container } from '@pdc/core';
import { ParentRepositoryProvider } from '@pdc/provider-repository';
import { JsonSchemaProvider } from '@pdc/provider-jsonschema';
import { MongoProvider } from '@pdc/provider-mongo';

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
    return {
      $id: 'user',
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        age: {
          type: 'integer',
          minimum: 0,
          default: 18,
        },
      },
      required: ['name'],
    };
  }

  public getModel() {
    return User;
  }
}