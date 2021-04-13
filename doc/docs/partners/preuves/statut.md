---
description: Vérifier le statut d'un trajet en passant son identifiant
---

# Vérifier le statut d'un trajet

Lors de l'envoi d'un trajet, un code 201 et un payload avec le `journey_id` et la date de création vous sont renvoyés. Le trajet est alors enregistré dans notre base. Le processus de validation par lequel vont passer les données est complexe, asynchrone et dépend de différents services ayant de temps de réponse variables. De plus, les données d'affichage de la liste détaillée de l'interface d'administration n'est rafraichi que toutes les 24h.

La solution la plus sûre pour vérifier le statut d'un trajet est avec le point d'API suivant.

### Requête

```
GET /v2/journeys/:journey_id
Authorization: Bearer <token>
```

### Réponses

#### 200 OK

Le trajet a été trouvé et son statut est retourné.  
Attention, le trajet peut être en erreur malgré le code 200, vérifiez le statut retourné.

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "result": {
    "journey_id": "string",
    "status": "string",
    "created_at": "ISODate"
  }
}
```

#### 401 Unauthorized

Le token applicatif est incorrect ou manquant

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "error": {
    "code": -32501,
    "message": "Unauthorized"
  }
}
```

#### 403 Forbidden

Le token applicatif ne permet pas d'accéder à cette route.  
Vous pouvez en créer un nouveau dans votre interface d'administration opérateur.

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "error": {
    "code": -32503,
    "message": "Forbidden"
  }
}
```

#### 404 Not found

Le trajet n'a pas été trouvé

```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "error": {
    "code": -32504,
    "message": "Not found"
  }
}
```
