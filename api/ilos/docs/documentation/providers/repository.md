---
title: Repository
lang: en-US
footer: Apache 2.0 Licensed
---


# Repository provider

A repository is a class to manage all requests to database, casting values to make sure data going in and out is formated correctly.   

## Installation

`yarn add @ilos/repository`

## Base

Define collection name, database name, validation schema, model and get a CRUD mongo repository. You also can add specific methods for your service.

```ts
@Container.provider({
  identifier: ExampleRepositoryProviderInterfaceResolver,
})
export class ExampleRepositoryProvider extends ParentRepositoryProvider implements ExampleRepositoryProviderInterface {
  constructor(protected config: ConfigProviderInterfaceResolver, protected mongoProvider: MongoProvider) {
    super(config, mongoProvider);
  }
  
  public getKey(): string {
    return 'myCollection';
  }
    
  public getDbName(): string {
    return this.config.get('example.db'); // you also can use config provider
  }
    
  public getModel(): Types.Newable<ExampleModel> {
    return ExampleModel;
  }
  
  public exampleSpecificMethod(params: any): Promise<any> {
    // do something
    return result;
  }
}
```

ParentRepository has basic CRUD (specifically :  find, all, create, delete, update, updateOrCreate, patch, clear ) and mongo id casting. 
Models can be instantiated by constructing the model with instantiate or instantiateMany ( for array ) methods. 

## Config
### Add interface and interface Resolver

```ts 
export interface ExampleRepositoryProviderInterface extends ParentRepositoryProviderInterface {
    exampleSpecificMethod(params: any): Promise<any>;
}

export abstract class ExampleRepositoryProviderInterfaceResolver extends ParentRepositoryProviderInterfaceResolver {
    public exampleSpecificMethod(params: any): Promise<any> {
        throw new Error();
    }
}
```
Make sur interface and interfaceResolver are up to date with the repository. 

### Add to service provider
```ts
@Container.serviceProvider({
  providers: [
    ExampleRepositoryProvider,
  ],
})
export class ServiceProvider extends Parents.ServiceProvider {}
```

## Usage
See [handler](/documentation/handler) for usage in handler


