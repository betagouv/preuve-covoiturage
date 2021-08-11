---
title: schema json
description: Version 2.0. Disponible à partir du 1er novembre 2019
---

# Schema JSON V2

Schema JSON pour l'envoi des trajets sur la route `POST /v2/journeys`  
Le schéma de données est présenté au format [JSON Schema Draft-07](https://json-schema.org/understanding-json-schema/index.html).

Le schéma complet est disponible à la fin de ce document. Afin de le rendre plus accessible, les données principales sont présentées en introduction.

> Voir également [Accès API](./acces.html).

::: tip

Les unités utilisées pour les valeurs sont :

- montants financiers en **centimes d'Euros**
- distances en **mètres**
- durées en **secondes**

:::

## Propriétés

**\*** Données obligatoires

- `journey_id`**\*** :  
  identifiant généré par l'opérateur. Doit être unique \(couple passager-conducteur\)
- `operator_journey_id` :  
  identifiant généré par l'opérateur pour regrouper des trajets \(plusieurs passagers avec un même conducteur\)
- `operator_class`**\*** :  
  classe de preuve correspondant aux spécifications définies dans [Classes de preuve de covoiturage](https://doc.covoiturage.beta.gouv.fr/le-registre-de-preuve-de-covoiturage/classes-de-preuve-and-identite/classes-a-b-c).

### Données sur l'identité de l'occupant

Ces données personnelles permettent d'identifier la personne effectuant le covoiturage afin de pouvoir comptabiliser ses trajets et lui distribuer des incitations en fonction des politiques applicables.

Les propriétés suivantes sont dans les objets : `passenger.identity` et `driver.identity`

- `firstname` : Prénom de l'occupant
- `lastname` : Nom de l'occupant
- `email` : Email de l'occupant
- `company` : Nom de l'organisation / employeur
- `travel_pass` : Carte de transport \(TCL, Navigo, Trabool, etc.\) possédée par l'occupant. Le numéro est obligatoire si l'information est disponible.

Deux options sont disponibles pour la transmission du numéro de téléphone.

**1.** Numéro complet à 10 chiffres \(ex. 06 12 34 56 78\)

- `phone` : Numéro complet à 10 chiffres au format ITU E.164 \(+33123456789\)

**2.** Numéro tronqué à 8 chiffres + identifiant unique de l'opérateur \(ex. 06 12 34 56 + 12345\)

- `phone_trunc` : Numéro tronqué à 8 chiffres
- `operator_user_id` : Identifiant de l'utilisateur chez l'opérateur

> `phone_trunc` et `operator_user_id` dépendent l'un de l'autre, si l'un est présent, l'autre doit l'être aussi.

La clé suivante n'est applicable qu'au passager :

- `over_18` : Le passager est majeur \(`TRUE`\) ou mineur \(`FALSE`\) ou non communiqué \(`NULL`\)

::: tip
De nombreuses campagnes utilisent cette information pour s'assurer que les bénéficiaires d'incitations sont majeures. La valeur `NULL` les exclues.
:::

#### Liste des passes transport supportés

Pour le moment, seul le passe `navigo` est supporté.

### Données géographiques

Les points de départ et d'arrivée du passager et du conducteur. `passenger.start`, `passenger.end`, `driver.start`, `driver.end`

- `datetime` \* Date et heure du départ/arrivée au format ISO 8601 \(`YYYY-MM-DDThh:mm:ssZ`\).

  L'heure est exprimée en UTC \(Coordinated Universal Time\). UTC n'est pas ajusté sur l'heure d'été et hiver !

- `lat` Latitude comprise entre 90deg et -90deg décimaux en datum WSG-84
- `lon` Longitude comprise entre 180deg et -180deg décimaux en datum WSG-84
- `insee` Code INSEE commune ou arrondissement de la position.

  Pour le métropoles qui comportent un code INSEE global et des codes par arrondissement, utiliser le code arrondissement.

- `literal` Adresse littérale, par exemple: _5 rue du Paradis, 75010 Paris_, _CEA, Saclay_
- `country` _Nom complet du pays \(France, Deutschland, etc.\)_

> L'ordre de priorité des propriétés de position est le suivant :
>
> 1. lon/lat
> 2. insee
> 3. literal/country
>
> Attention, **lon** dépend de **lat** et **literal** dépend de **country**.

### Données financières

::: tip
Le principe est de coller au plus près avec la réalité comptable \(transaction usager\) et d'avoir suffisamment d'informations pour recalculer le coût initial du trajet. Ceci afin de s'assurer du respect de la définition du covoiturage et de la bonne application des politiques incitatives gérées par le registre.
:::

- `passenger.contribution`**\*** : Coût réel total du service pour l’occupant passager en fonction du nombre de sièges réservés **APRÈS** que toutes les possibles incitations aient été versées \(subventions employeurs, promotions opérateurs, incitations AOM, etc\).
- `driver.revenue`**\*** : La somme réellement perçue par le conducteur **APRÈS** que toutes les incitations \(subventions employeurs, promotions opérateurs, incitations AOM, etc.\), contributions des passagers aient été versées et que la commission de l’opérateur soit prise.
- `passenger.seats`**\*** : Nombre de sièges réservés par l'occupant passager. Défault : 1

**Schéma des incitations**

- `incentives` \* : Tableau reprenant la liste complète des incitations appliquées \(ordre d'application, montant, identifiant de l'incitateur\). Si aucune incitation, envoyer un tableau vide : `[]`

```text
{
    index: <Number>  *        // ordre d'application [0,1,2]
    amount: <Number> *        // montant de l'incitation en centimes d'euros
    siret: <String>  *        // Numéro SIRET de l'incitateur
}
```

> Le SIRET est un identifiant unique par structure juridique. Toutes les entités incitatrices en possèdent un.

Par défaut, l'ordre d'application des politiques incitatives est le suivant :

1. Territoire \(AOM, Région, ...\)
2. Sponsors \(incitations employeur, CE, etc.\)
3. Opérateur \(opération promotionnelle, offres, etc.\)

**Schéma du mode de paiement sous forme de Titre-Mobilité**

::: tip
La prise en charge des frais de transports personnel \(carburant et forfait mobilité\) pourra prendre la forme d’une solution de paiement spécifique, dématérialisée et prépayée, intitulée « titre-mobilité ». Ainsi, il apparaît comme pertinent de détailler la solution de paiement utilisée dans le cadre d'un trajet covoituré, s'il s'agit de Titre-Mobilité.
:::

- `payments` : Zéro, une ou plusieurs méthodes de paiement utilisées \(ex. carte employeur préchargée permettant de payer directement le covoiturage sur une application\).

```text
{
    index: <Number> *    // ordre d'application (0, 1, 2, ...)
    siret: <String> *    // n° SIRET de l'établissement payeur
    type: <String> *     // nom du titre
    amount: <Number> *   // montant en centimes d'euros
}
```

## Schéma JSON complet

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Registre de preuve de covoiturage - Journey Schema V2",
  "$id": "rpc.journey.v2",
  "definitions": {
    "macros": {
      "varchar": {
        "type": "string",
        "minLength": 1,
        "maxLength": 255
      },
      "longchar": {
        "type": "string",
        "minLength": 1,
        "maxLength": 511
      },
      "email": {
        "type": "string",
        "format": "email",
        "minLength": 5,
        "maxLength": 256
      },
      "phone": {
        "type": "string",
        "minLength": 10,
        "maxLength": 15
      },
      "phone_trunc": {
        "type": "string",
        "minLength": 8,
        "maxLength": 15
      },
      "timestamp": {
        "type": "string",
        "pattern": "^\\d\\d\\d\\d-[0-1]\\d-[0-3]\\d[T\\s](?:[0-2]\\d:[0-5]\\d:[0-5]\\d|23:59:60)(?:\\.\\d+)?(?:Z|[+-]\\d\\d(?::?\\d\\d)?)$"
      },
      "lat": {
        "type": "number",
        "minimum": -90,
        "maximum": 90
      },
      "lon": {
        "type": "number",
        "minimum": -180,
        "maximum": 180
      },
      "insee": {
        "type": "string",
        "format": "insee",
        "minLength": 5,
        "maxLength": 5
      },
      "siret": {
        "type": "string",
        "format": "siret",
        "minLength": 14,
        "maxLength": 14
      }
    },
    "travelpass": {
      "type": "object",
      "minProperties": 2,
      "additionalProperties": false,
      "properties": {
        "name": {
          "enum": ["navigo"]
        },
        "user_id": {
          "$ref": "#/definitions/macros/varchar"
        }
      }
    },
    "identity": {
      "type": "object",
      "anyOf": [{ "required": ["phone"] }, { "required": ["operator_user_id", "phone_trunc"] }],
      "additionalProperties": false,
      "properties": {
        "firstname": {
          "$ref": "#/definitions/macros/varchar"
        },
        "lastname": {
          "$ref": "#/definitions/macros/varchar"
        },
        "email": {
          "$ref": "#/definitions/macros/email"
        },
        "phone": {
          "$ref": "#/definitions/macros/phone"
        },
        "phone_trunc": {
          "$ref": "#/definitions/macros/phone_trunc"
        },
        "operator_user_id": {
          "$ref": "#/definitions/macros/varchar"
        },
        "company": {
          "$ref": "#/definitions/macros/varchar"
        },
        "over_18": {
          "enum": [true, false, null],
          "default": null
        },
        "travel_pass": { "$ref": "#/definitions/travelpass" }
      }
    },
    "position": {
      "type": "object",
      "required": ["datetime"],
      "additionalProperties": false,
      "minProperties": 2,
      "dependencies": {
        "lat": ["lon"],
        "lon": ["lat"],
        "country": ["literal"]
      },
      "properties": {
        "datetime": {
          "$ref": "#/definitions/macros/timestamp"
        },
        "lat": {
          "$ref": "#/definitions/macros/lat"
        },
        "lon": {
          "$ref": "#/definitions/macros/lon"
        },
        "insee": {
          "$ref": "#/definitions/macros/insee"
        },
        "country": {
          "$ref": "#/definitions/macros/varchar"
        },
        "literal": {
          "$ref": "#/definitions/macros/longchar"
        }
      }
    },
    "incentive": {
      "type": "object",
      "required": ["index", "siret", "amount"],
      "additionalProperties": false,
      "properties": {
        "index": {
          "type": "integer",
          "minimum": 0
        },
        "siret": {
          "$ref": "#/definitions/macros/siret"
        },
        "amount": {
          "type": "number",
          "minimum": 0,
          "maximum": 20000
        }
      }
    },
    "payment": {
      "type": "object",
      "required": ["pass", "amount"],
      "additionalProperties": false,
      "properties": {
        "index": {
          "type": "integer",
          "minimum": 0,
          "maximum": 42
        },
        "siret": {
          "$ref": "#/definitions/macros/siret"
        },
        "type": {
          "$ref": "#/definitions/macros/varchar"
        },
        "amount": {
          "type": "integer",
          "minimum": 0,
          "maximum": 100000
        }
      }
    },
    "passenger": {
      "type": "object",
      "required": ["identity", "start", "end", "contribution", "incentives"],
      "additionalProperties": false,
      "properties": {
        "identity": { "$ref": "#/definitions/identity" },
        "start": { "$ref": "#/definitions/position" },
        "end": { "$ref": "#/definitions/position" },
        "seats": {
          "type": "integer",
          "default": 1,
          "minimum": 1,
          "maximum": 8
        },
        "contribution": {
          "type": "integer",
          "minimum": 0,
          "maximum": 1000000,
          "$comment": "Montant après que toutes les incitations aient été attribuées"
        },
        "incentives": {
          "type": "array",
          "minItems": 0,
          "items": { "$ref": "#/definitions/incentive" }
        },
        "payments": {
          "type": "array",
          "minItems": 0,
          "items": { "$ref": "#/definitions/payment" }
        },
        "distance": {
          "type": "integer",
          "exclusiveMinimum": 0,
          "maximum": 1000000
        },
        "duration": {
          "type": "integer",
          "exclusiveMinimum": 0,
          "maximum": 86400
        }
      }
    },
    "driver": {
      "type": "object",
      "required": ["identity", "start", "end", "revenue", "incentives"],
      "additionalProperties": false,
      "properties": {
        "identity": { "$ref": "#/definitions/identity" },
        "start": { "$ref": "#/definitions/position" },
        "end": { "$ref": "#/definitions/position" },
        "revenue": {
          "type": "integer",
          "minimum": 0,
          "maximum": 1000000,
          "$comment": "Montant perçu après que toutes les incitations et contributions des passagers aient été attribuées"
        },
        "incentives": {
          "type": "array",
          "minItems": 0,
          "maxItems": 20,
          "items": { "$ref": "#/definitions/incentive" }
        },
        "payments": {
          "type": "array",
          "minItems": 0,
          "items": { "$ref": "#/definitions/payment" }
        },
        "distance": {
          "type": "integer",
          "exclusiveMinimum": 0,
          "maximum": 1000000
        },
        "duration": {
          "type": "integer",
          "exclusiveMinimum": 0,
          "maximum": 86400
        }
      }
    }
  },
  "type": "object",
  "required": ["journey_id", "operator_class"],
  "anyOf": [{ "required": ["passenger"] }, { "required": ["driver"] }],
  "additionalProperties": false,
  "properties": {
    "journey_id": {
      "$ref": "#/definitions/macros/varchar"
    },
    "operator_journey_id": {
      "$ref": "#/definitions/macros/varchar"
    },
    "operator_class": {
      "enum": ["A", "B", "C"]
    },
    "passenger": { "$ref": "#/definitions/passenger" },
    "driver": { "$ref": "#/definitions/driver" }
  }
}
```
