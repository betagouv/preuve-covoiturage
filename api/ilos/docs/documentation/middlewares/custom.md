---
title: Create a custom middleware
lang: en-US
footer: Apache 2.0 Licensed
---
# Custom middleware

You can create a custom middleware by implementing `MiddlewareInterface`. You must decorate your middleware with the `@Container.middleware()`;

## Process method
The process method is the only imposed method. It receive: 
- params: the request parameters (ex: { title: 'My blog post' }) ;
- context: the context of the call (user, permission, channel, etc.) ;
- next : the next middleware function which must be called with params and context
- middlewareParams: the last argument is facultative, it used to pass args to middleware from action (ex: permission middleware should received a list of needed permission)

## Middleware parameters
You can configure your middleware by using the fourth arguments. In your action, use: 
```ts
  public readonly middlewares: (string|[string, any])[] = [
    ['can', ['user.list']]
  ];
```
Here, the 'can' middleware receive ['user.list'] as middlewareParams argument.

## Constructor
In the middleware constructor, you can add dependencies resolved by IOC container.

```ts
  constructor(
    protected config: ConfigProviderInterfaceResolver
  ) {
    //
  }
```
Here we get this.config resolved by ConfigProviderInterfaceResolver.

## Examples
### Before middleware
```ts
import { Container, Interfaces, Types } from '@ilos/core';
@Container.middleware()
export class PermissionMiddleware implements Interfaces.MiddlewareInterface {
  async process(
    params: Types.ParamsType,
    context: Types.ContextType,
    next: Function,
    middlewareParams?: any[],
  ): Promise<Types.ResultType> {
    // Here we can : throw an RPC Exception, modify context or params
    const modifiedParams = params;
    return next(modified, context);
  }
}
```

### After middleware
```ts
import { Container, Interfaces, Types } from '@ilos/core';
@Container.middleware()
export class PermissionMiddleware implements Interfaces.MiddlewareInterface {
  async process(
    params: Types.ParamsType,
    context: Types.ContextType,
    next: Function,
    middlewareParams?: any[],
  ): Promise<Types.ResultType> {
    const response = await next(params, context);
    // Here we can : throw an RPC Exception or modify reponse
    return { ...response };
  }
}
```
