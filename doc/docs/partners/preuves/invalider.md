---
description: Page en cours de construction
---

# Invalider un trajet

S'il détecte un comportement inhabituel ou une fraude avérée, un opérateur doit communiquer auprès du Service l'invalidation du trajet concerné dès lors qu'il est déjà inscrit dans le registre. Cette invalidation doit avoir lieu dès que l'opérateur a connaissance de cette irrégularité.

### Requête

```
DELETE /v2/journeys/:journey_id
Authorization: Bearer <token>
```

### Réponses

#### 200 OK

La demande d'invalidation a été prise en compte.

#### 401 Unauthorized

Le token applicatif est incorrect ou manquant

#### 403 Forbidden

Le token applicatif ne permet d'accéder à cette route.  
Vous pouvez en créer un nouveau dans votre interface d'administration opérateur.

#### 404 Not found

Le trajet n'a pas été trouvé
