---
title: Basics
lang: en-US
footer: Apache 2.0 Licensed
---
# Middleware

## What is a middleware ?
A middleware is a class that implement MiddlewareInterface. This interface have a single imposed method : 
```ts
  process(params: ParamsType, context: ContextType, next?: Function, options?: any):Promise<ResultType>;
```

## How to use it
- Step 1 : add a binding to your service provider : 
```ts
@Container.serviceProvider({
  middlewares: [
    ['can', PermissionMiddleware],
  ],
})
```
- Step 2 : add this middleware to your actions : 
```ts
readonly middlewares: (string|[string, any])[] = [
  ['can', ['user.list']]
];
```

That's all! You can create your own middleware, find [how](custom)
