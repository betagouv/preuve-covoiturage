---
title: Service provider
lang: en-US
footer: Apache 2.0 Licensed
---
# Service provider

## Concept
Service provider aims to configure your service, especially : 
- declare handlers
- declare container binding (IOC configuration)
- declare middlewares
- etc...

## Recipes
### Container bindings
```ts
  @Container.serviceProvider({
    providers: [
      [MyInterfaceResolver, MyImplementation], // bind MyInterfaceResolver to MyImplementation
      MyIocReadyClass, // equivalent to [MyIocReadyClass, MyIocReadyClass]
    ],
  })
```
You can add your bindings in the `providers` keyword in service provider decorator. By example, you can bind ConfigProviderInterfaceResolver to ConfigProvider. By doing this, if you add ConfigProviderInterfaceResolver in your constructor, the container will inject ConfigProvider.

Note: you always can acces to the current container with `this.getContainer()` to write custom bindigs.

### Child services providers declaration
```ts
  @Container.serviceProvider({
    children: [
      ChildServiceProvider,
    ],
  })
```
You can add child service provider. In this case, ChildServiceProvider will access all of the bound class of the parent container. By example, if you have declared some provider inside the root service provider, the child can use them. It can override it by declaring itself another alias.

### Declare handlers
```ts
  @Container.serviceProvider({
    handlers: [
      MyCustomAction,
    ],
  })
```
Every handlers declared in the service provider will be callable.

### Bind middleware
```ts
  @Container.serviceProvider({
    middlewares: [
      ['can', PermissionMiddleware],
    ],
  })
```
This shorcut allow you to bind a string ('can') to a middleware class (PermissionMiddleware). By doing this, you can use the middleware in your action without importing it.

## Example
```ts
import { Parents, Container } from '@ilos/core';

@Container.serviceProvider({
  providers: [
    [MyInterfaceResolver, MyImplementation], // bind MyInterfaceResolver to MyImplementation
    MyIocReadyClass, // equivalent to [MyIocReadyClass, MyIocReadyClass]
  ],
  children: [
    ChildServiceProvider,
  ],
  handlers: [
    MyCustomAction,
  ],
  middlewares: [
    ['can', PermissionMiddleware],
  ],
})
export class ServiceProvider extends Parents.ServiceProvider {}
```
