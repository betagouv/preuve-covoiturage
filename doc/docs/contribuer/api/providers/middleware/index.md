---
title: Middleware
---

# Middleware provider

Collection de middlewares permettant de filtrer en amont ou en aval de l'execution des actions.

### ChannelService

id: `channel_service`

Bloque ou autorise l'accès à une action en se basant sur le _channel_ de l'appelant.

**Liste d'interdiction :** `channel_service.except`  
Seuls les services listés sont interdits.

**Liste d'autorisation :** `channel_service.only`  
Seuls les services listés sont autorisés.

```typescript
// action can only be called from the trip service
middlewares: [['channel_service.only', ['trip']]],

// action can be called by all services but the proxy
middlewares: [['channel_service.except', ['proxy']]],
```

### Content

id: `content`

Bloque ou autorise l'accès à une action en se basant sur le _content_ de l'appelant.

**Liste d'interdiction :** `content.except`  
Seuls les services listés sont interdits.

**Liste d'autorisation :** `content.only`  
Seuls les services listés sont autorisés.

```typescript
// TODO
```

### CopyFromContext

id: `copy.from_context`  
fn : `copyFromContextMiddleware(fromPath: string, toPath: string)`

Copie le contenu d'une propriété de `context` dans le payload.

```typescript
import { copyFromContextMiddleware } from '@pdc/provider-middleware';


// helper
middlewares: [
  copyFromContextMiddleware('call.user.operator_id', 'operator_id'),
],
```

### Environnement

id: `environment`  
fn: `environmentBlacklistMiddleware(string[])`  
fn: `environmentWhitelistMiddleware(string[])`

**Liste d'interdiction :** `environment.except`  
Seuls les services listés sont interdits.

**Liste d'autorisation :** `environment.only`  
Seuls les services listés sont autorisés.

### HasPermission

id: `has_permission`  
fn: `hasPermissionMiddleware(string[])`

#### HasPermissionByScope

id: `has_permission.by_scope`  
fn: `hasPermissionByScopeMiddleware(globalPermission: string, [string, string, string][])`

```typescript
// TODO
```

### Logger

id: `logger`  
fn: `loggerMiddleware()`

Affiche les `params` et `context` en amont de l'action. Affiche les `response`, `params` et `context` en aval.

Les erreurs sont attrapées et affichées.

:warning: la position du middleware dans la liste fait varier les résultats.

```typescript
middlewares: [
  someMiddleware(),
  loggerMiddleware(),
  otherMiddleware(),
]
```

### ValidateDate

id: `validate.date`  
fn:

```typescript
  validateDateMiddleware({
    startPath: string,
    endPath: string,
    minStart?: (params: ParamsType, context: ContextType) => Date,
    maxEnd?: (params: ParamsType, context: ContextType) => Date,
    applyDefault?: boolean,
  })
```