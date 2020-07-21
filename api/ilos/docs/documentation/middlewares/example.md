---
title: Example
lang: en-US
footer: Apache 2.0 Licensed
---

# Example

## Action


Example of a simple action to find a user by id

```ts

/*
 * Find user by id
 */
@Container.handler({
  service: 'user',
  method: 'get',
})
export class GetAction extends Parents.Action {
  public readonly middlewares: (string | [string, any])[] = [
    ['nameFilter', ['jon','helena']],
  ];

  public async handle(request: {id: string}, context: Types.ContextType): Promise<User> {
    
    return findUserbyId(request.id);
  }
}


```


## NameFilterMiddleware

Accept request if user has one of the names defined in config

```ts


type NamePermissionType = string[];

@Container.middleware()
export class NamePermissionMiddleware implements Interfaces.MiddlewareInterface {
  async process(
    params: Types.ParamsType,
    context: Types.ContextType,
    next: Function,
    names: NamePermissionType,
  ): Promise<Types.ResultType> {
    
    const userName = context.call.user.name;
    
    if (names.indexOf(userName) !== -1) {
        return next(params, context);
    } else {
        throw new Exceptions.ForbiddenException('Invalid user name');
    }
     

  }

}

```

## KeyFilterMiddleware

Filter out key from result

```ts


type KeyOutputFilterType = string;

@Container.middleware()
export class KeyOuputFilterMiddleware implements Interfaces.MiddlewareInterface {
  async process(
    params: Types.ParamsType,
    context: Types.ContextType,
    next: Function,
    key: KeyOutputFilterType,
  ): Promise<Types.ResultType> {
    
    const user = await next(params, context);
    
    delete user[key];
    
    return user;

  }

}

```

## Register to middlewares in service provider

```ts
 public readonly middlewares: [string, Types.NewableType<Interfaces.MiddlewareInterface>][] = [
    ['namePermission', NamePermissionMiddleware],
    ['keyOutputFilter', KeyOutputFilterMiddleware],
  ];

```


## Call middlewares in action

```ts

/*
 * Find user by id
 */
@Container.handler({
  service: 'user',
  method: 'get',
})
export class GetAction extends Parents.Action {

  //MIDDLEWARE
  public readonly middlewares: (string | [string, any])[] = [
    ['namePermission', ['jon','helena']],
    ['keyOutputFilter', 'id']
  ];

  public async handle(request: {id: string}, context: Types.ContextType): Promise<User> {
    
    return findUserbyId(request.id);
  }
}

```
