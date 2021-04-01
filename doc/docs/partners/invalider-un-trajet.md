---
description: Page en cours de construction
---

# Invalider un trajet

S'il détecte un comportement inhabituel ou une fraude avérée, un opérateur doit communiquer auprès du Service l'invalidation du trajet concerné dès lors qu'il est déjà inscrit dans le registre. Cette invalidation doit avoir lieu dès que l'opérateur a connaissance de cette irrégularité.

{% api-method method="delete" host="https://api.covoiturage.beta.gouv.fr" path="/v2/journeys/:journey\_id" %}
{% api-method-summary %}
Journey 
{% endapi-method-summary %}

{% api-method-description %}
Déclare l'invalidation d'un trajet préalablement enregistré auprès du registre
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
Token applicatif avec la permission `journey.delete`
{% endapi-method-parameter %}
{% endapi-method-headers %}
{% endapi-method-request %}

{% api-method-response %}
{% api-method-response-example httpCode=200 %}
{% api-method-response-example-description %}
La demande d'invalidation a été prise en compte.
{% endapi-method-response-example-description %}

```

```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=403 %}
{% api-method-response-example-description %}
Le token applicatif ne permet d'accéder à cette route.   
Vous pouvez en créer un nouveau dans votre interface d'administration opérateur.
{% endapi-method-response-example-description %}

```

```
{% endapi-method-response-example %}

{% api-method-response-example httpCode=404 %}
{% api-method-response-example-description %}
Le trajet n'a pas été trouvé
{% endapi-method-response-example-description %}

```

```
{% endapi-method-response-example %}
{% endapi-method-response %}
{% endapi-method-spec %}
{% endapi-method %}

