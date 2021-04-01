---
description: Vérifier le statut d'un trajet en passant son identifiant
---

# Vérifier le statut d'un trajet

Lors de l'envoi d'un trajet, un code 201 et un payload avec le `journey_id` et la date de création vous sont renvoyés. Le trajet est alors enregistré dans notre base. Le processus de validation par lequel vont passer les données est complexe, asynchrone et dépend de différents services ayant de temps de réponse variables. De plus, les données d'affichage de la liste détaillée de l'interface d'administration n'est rafraichi que toutes les 24h.

La solution la plus sûre pour vérifier le statut d'un trajet est avec le point d'API suivant.

{% api-method method="get" host="https://api.covoiturage.beta.gouv.fr" path="/v2/journeys/:journey\_id" %}
{% api-method-summary %}
Journey status
{% endapi-method-summary %}

{% api-method-description %}

{% endapi-method-description %}

{% api-method-spec %}
{% api-method-request %}
{% api-method-path-parameters %}
{% api-method-parameter name="journey\_id" type="string" required=true %}
journey\_id unique envoyé dans le payload lors de la soumission du trajet
{% endapi-method-parameter %}
{% endapi-method-path-parameters %}

{% api-method-headers %}
{% api-method-parameter name="Authentication" type="string" required=true %}
Token applicatif avec la permission `journey.create`.
{% endapi-method-parameter %}
{% endapi-method-headers %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
Le trajet a été trouvé et son statut est retourné.  
**Attention**, le trajet peut être en erreur malgré le code 200
{% endapi-method-response-example-description %}

```javascript
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
{% endapi-method-response-example %}

{% api-method-response-example httpCode=401 %}
{% api-method-response-example-description %}
Le token applicatif est incorrect ou manquant
{% endapi-method-response-example-description %}

```javascript
{
	"id": 1,
	"jsonrpc": "2.0",
	"error": {
    code: -32501,
    message: 'Unauthorized',
  }
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=403 %}
{% api-method-response-example-description %}
Le token applicatif ne permet pas d'accéder à cette route.  
Vous pouvez en créer un nouveau dans votre interface d'administration opérateur.
{% endapi-method-response-example-description %}

```javascript
{
	"id": 1,
	"jsonrpc": "2.0",
	"error": {
    code: -32503,
    message: 'Forbidden',
  }
}
```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=404 %}
{% api-method-response-example-description %}
Le trajet n'a pas été trouvé
{% endapi-method-response-example-description %}

```javascript
{
	"id": 1,
	"jsonrpc": "2.0",
	"error": {
    code: -32504,
    message: 'Not found',
  }
}
```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}



