---
title: Create a custom provider
lang: en-US
footer: Apache 2.0 Licensed
---

## Basics
You may create your own provider. In order to do that, you may create a simple decorated class as: 
```ts
import { Container } from '@ilos/core';

@Container.provider()
class MyProvider {
  doSomething() {
    //
  }
}
```

You can register this provider in your service provider as :
```ts
import { Container, Parents } from '@ilos/core';
import { MyProvider } from './providers/MyProvider';

@Container.serviceProvider({
  providers: [
    MyProvider,
  ],
})
```

And now, use it everywhere by adding it to the constructor
```ts
  constructor(
    private myProvider: MyProvider,
  )
```

## Recipes
### Custom identifier

If your provider may have several implementation (or you want to have a losely coupled architecture, which should be a good idea), you can add an identifier to your provider. You can do it two ways (see after). By doing this, you may use it by injecting `MyProviderInterfaceResolver` instead of `MyProvider` in the constructor.
```ts
  constructor(
    private myProvider: MyProviderInterfaceResolver,
  )
```

#### Using the provider decorator (prefered)
```ts
import { Container } from '@ilos/core';
import { MyProviderInterface, MyProviderInterfaceResolver } from '../interfaces/MyProviderInterface';

@Container.provider({
  identifier: MyProviderInterfaceResolver,
})
class MyProvider implements MyProviderInterface {
  doSomething() {
    //
  }
}
```

#### Using the service provider decorator
```ts
import { Container, Parents } from '@ilos/core';
import { MyProvider } from './providers/MyProvider';
import { MyProviderInterfaceResolver } from './interfaces/MyProviderInterface';

@Container.serviceProvider({
  providers: [
    [MyProviderInterfaceResolver, MyProvider],
  ],
})
```
### Hooks

You may use hook on your provider. It should implements `RegisterHookInterface`, `InitHookInterface`, or `DestroyHookInterface`.

## Shared providers

Sometimes, you may have a provider which is used by several services. You can create a package to shared it.

### Suggested directory structure
```
providers
│
└───custom
    |   package.json
    |   tsconfig.json
    |   ...
    └─── src
        │   CustomProvider.ts
        |   CustomProvider.spec.ts
        |   index.ts
        └─── interfaces
            |   CustomProviderInterface.ts
```
### Base 

CustomProvider.ts defines the exported methods of the provider. 

```ts 
@Container.provider({
  identifier: CustomProviderInterfaceResolver
})
export class CustomProvider implements CustomProviderInterface {
    public doSomething(params:any): any {
        return data;
    }
}
```


### Interface and Interface resolver
```ts 
import { Interfaces } from '@ilos/core';

export interface CustomProviderInterface extends Interfaces.ProviderInterface{
  doSomething(params:any): any;
}

export abstract class CustomProviderInterfaceResolver implements CustomProviderInterface {
  doSomething(params:any): any {
    throw new Error();  
  }
}
```

### Export

index.ts defines the exported classes

```ts 
export { CustomProvider } from './CustomProvider';
export { CustomProviderInterface, CustomProviderInterfaceResolver } from './interfaces/CustomProviderInterface';
```
