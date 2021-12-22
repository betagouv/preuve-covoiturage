# **Création de l’attestation**

## Configuration de la requête

1. La requête est authentifiée avec un [token applicatif](/operateurs/preuves/acces) à ajouter à l'entête de la requête : `Authorization: Bearer <token>`
2. Le fuseau horaire est requis
2. L'identité est requise
3. Le filtrage géographique est optionnel
4. Les dates de début et de fin sont optionnelles
5. La date de fin la plus récente possible est J-6
6. La date de début la plus ancienne est le 1er janvier de l'année précédente

> Voir la [création avancée](#creation-avancee) pour le détail des options

## Création simple

Les données requises pour la création ne concernent que l'identité de la personne et le fuseau horaire.

Par défaut, l'attestation sera générée pour l'année précédente sans restrictions géographiques.

Chaque appel, même si les paramètres sont les mêmes, entraine la création d'une attestation unique.

Les attestations ne peuvent être supprimées. [Contactez notre équipe](mailto:technique@covoiturage.beta.gouv.fr) au besoin.

::: tip Vous pouvez récupérer le fuseau horaire de l'utilisateur en Javascript.
```js
const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
```
:::

L'identité peut être passée de 3 manières différentes :

1. `phone` : le numéro de téléphone complet au format ISO
2. `phone_trunc` + `operator_user_id` : le numéro de téléphone tronqué plus votre identifiant utilisateur
3. `operator_user_id` : votre identifiant utilisateur uniquement (valable uniquement si vous avez transmis des trajets avec le couple `phone_trunc` + `operator_user_id`)

```js
POST /v2/certificates
Authorization: Bearer ${application_token}

Request {
    "tz": "Europe/Paris",
    "identity": {
        "phone": "+33612345678"
        // OU
        "phone_trunc": "+336123456",
        "operator_user_id": "1111-222-333-4444"
        // OU
        "operator_user_id": "1111-222-333-4444"
    },
}
```

## Création avancée

### Dates de début et de fin

Les dates sont au format ISO: `2021-01-01T00:00:00+0100`.

- `start_at`: date de début
- `end_at`: date de fin

La période utilisée est supérieure ou égale à la date de début et strictement inférieure à la date de fin.

Par exemple, pour les trajets entre le 1er janvier et le 30 juin inclus :

```js
{
  "start_at": "2021-01-01T00:00:00+0100",
  "end_at": "2021-07-01T00:00:00+0200"
}
```

ℹ️ le fuseau horaire change avec l'heure d'été.

### Filtrage géographique

Pour sélectionner des trajets en fonction de leur point de départ et d'arrivée, il est possible de les préciser avec la clé `positions`.

Tous les trajets ayant un départ **et** une arrivée dans un rayon de `1km` autour des points donnés seront inclus à l'attestation.

```js
POST /v2/certificates
Authorization: Bearer ${application_token}

Request {
    // Paramètres obligatoires
    "tz": "Europe/Paris",
    "identity": {
        "phone": "+33612345678"
        // OU
        "phone_trunc": "+336123456",
        "operator_user_id": "1111-222-333-4444"
        // OU
        "operator_user_id": "1111-222-333-4444"
    },

    // Paramètres optionnels
    "start_at": "2020-01-01T00:00:00+0100",
    "end_at": "2021-01-01T00:00:00+0100",

    // départ et arrivée par exemple.
    // Radius de 1km. Maximum 2 positions
    "positions": [{
        "lon": -0.557483,
        "lat": 47.682821
    }, {
        "lon": -0.952637,
        "lat": 47.452236
    }],
}
```

## Codes réponse

Les données calculées de l'attestation sont retournées dans la réponse pour permettre leur affichage par votre application.

Vous pouvez reconstruire l'URL de validation publique avec l'UUID comme suit :  
`https://app.covoiturage.beta.gouv.fr/attestations/<uuid>`

### Attestation créée 🎉

```javascript
Response [201 Created] {
    "uuid": "8a9d2da9-39e3-4db7-be8e-12b4d2179fda",
    "created_at": "2020-01-01T00:00:00+0100",
    "meta": {
        "tz": "Europe/Paris",
        "positions": [{
            "lon": -0.557483,
            "lat": 47.682821
        }, {
            "lon": -0.952637,
            "lat": 47.452236
        }],
        "driver": {
            "total": {
                "trips": 2,
                "week_trips": 1,
                "weekend_trips": 1,
                "km": 20,
                "euros": 2.0
            },
            "trips": [
              {
                  "type": "driver",
                  "datetime": "2021-01-01T06:00:00Z",
                  "trips": 1,
                  "km": 10,
                  "euros": 1.0
              },
              // etc...
            ]
        },
        "passenger": {
            "total": {
                "trips": 2,
                "week_trips": 1,
                "weekend_trips": 1,
                "km": 20,
                "euros": 2.0
            },
            "trips": [
              {
                  "type": "driver",
                  "datetime": "2021-01-01T06:00:00Z",
                  "trips": 1,
                  "km": 10,
                  "euros": 1.0
              },
              // etc...
            ]
        }
    }
}
```

### Non authentifié

Le token est manquant ou invalide.

```js
// invalid application_token
Response [401 Unauthorized] {
    "code": 401,
    "error": "Unauthorized"
}
```

### Accès refusé

Les permissions de votre token applicatif ne vous permettent pas de créer une attestation.  
Vous pouvez générer un nouveau token et réessayer. Si le problème persiste, [contactez notre équipe](mailto:technique@covoiturage.beta.gouv.fr).

```js
// missing permission in the application_token scope
Response [403 Forbidden] {
    "code": 403,
    "error": "Forbidden"
}
```

### Identité non trouvée

L'identité n'a pu être trouvée. Vérifiez les identifiants envoyés.

```js
Response [404 Not Found] {
    "code": 404,
    "error": "Not Found"
}
```
