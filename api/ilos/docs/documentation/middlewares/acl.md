---
title: Authorization
lang: en-US
footer: Apache 2.0 Licensed
---

# Authorizations
Check if the user making the request is authorized to proceed. 

## Usage

### Register to middleware in service provider
```ts
import { PermissionMiddleware } from '@ilos/package-acl';

@Container.serviceProvider({
  middlewares: [
    ['can', PermissionMiddleware],
  ],
})
```

### Call middleware in service provider
```ts
public readonly middlewares: (string | [string, any])[] = [
  ['can', ['permissionName']],
];
```
In this case 'permissionName' must be among the user's permissions, defined in the context. You can specify more than one permission. 
