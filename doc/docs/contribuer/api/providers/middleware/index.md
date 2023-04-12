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

### HasPermissionByScope

id: `has_permission.by_scope`  
fn: `hasPermissionByScopeMiddleware(globalPermission: string, [string, string, string][])`

```typescript
// TODO
```

## Helpers

Des helpers sont disponibles pour simplifier l'utilisation répétitive des middlewares.

#### `copyGroupIdFromContextMiddlewares`

1. Copie l'identifiant du group du contexte aux paramètres

Il est possible de définir un préfixe pour la clé. Passer `null` si vous devez utiliser le troisième argument `preserve`.

On peut aussi décider de conserver la valeur des paramètres si elle existe déjà.

Retourne un tableau de middlewares.

```ts
middlewares: [
  ...copyGroupIdFromContextMiddlewares(['territory_id', 'operator_id'], null, true),
]
```

#### `copyGroupIdAndApplyGroupPermissionMiddlewares`

1. Copie l'identifiant groupe ou utilisateur (`_id`, `territory_id`, `operator_id`) dans les paramètres de la requête à partir du contexte utilisateur ;
2. Configure les permissions du groupe.

Retourne un tableau de middlewares.

```ts
middlewares: [
  ...copyGroupIdAndApplyGroupPermissionMiddlewares({
    operator: 'operator.service.action',
    registry: 'registry.service.action',
  })
]
```

#### `internalOnlyMiddlewares`

Retourne un tableau de middlewares avec les services en liste blanche s'ils sont passés en argument ou une liste noire comportant `proxy`, le seul service externe.

```ts
// exclure le proxy et autoriser tous les autres services
middlewares: [
  ...internalOnlyMiddlewares(),
]

// exclure une liste de services
middlewares: [
  ...internalOnlyMiddlewares('acquisition', 'carpool'),
]
```

### Logger

id: `logger`  
fn: `loggerMiddleware()`

Affiche les `params` et `context` en amont de l'action. Affiche les `response`, `params` et `context` en aval.

Les erreurs sont attrapées et affichées.

:warning: la position du middleware dans la liste fait varier les résultats.

```ts
middlewares: [
  someMiddleware(),
  loggerMiddleware(),
  otherMiddleware(),
]
```

### ValidateDate

id: `validate.date`  
fn:

```ts
  validateDateMiddleware({
    startPath: string,
    endPath: string,
    minStart?: (params: ParamsType, context: ContextType) => Date,
    maxEnd?: (params: ParamsType, context: ContextType) => Date,
    applyDefault?: boolean,
  })
```