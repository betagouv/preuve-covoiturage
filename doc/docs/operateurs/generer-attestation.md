---
title: Attestations
description: Génération d'attestations pour les utilisateurs de services de covoiturage
---

# Attestations de covoiturage

::: tip Attestation sur l'honneur
Cette page concerne les attestations fournies par les opérateurs de covoiturage.

Rendez-vous sur [https://attestation.covoiturage.beta.gouv.fr/](http://attestation.covoiturage.beta.gouv.fr/) pour générer votre attestation sur l'honneur.
:::

:warning: Cette fonctionnalité est en cours de développement.

En tant qu'opérateur de covoiturage, contactez nous si vous souhaitez y participer : [technique@covoiturage.beta.gouv.fr](mailto:technique@covoiturage.beta.gouv.fr)

Merci de [créer des tickets](https://github.com/betagouv/preuve-covoiturage/issues/new?template=certificate.md&labels=ATTESTATION&assignees=jonathanfallon) si vous rencontrez des problèmes.

## Statut de développement des fonctionnalités

- :white_check_mark: Génération de l'attestation par l'opérateur ;
- :white_check_mark: Téléchargement d'un PDF ;
- :white_check_mark: Page de vérification de l'attestation en ligne \(accès public\) ;
- :white_check_mark: Envoi de meta-données pour injecter les données personnelles du covoitureur ;
- :white_check_mark: Upload du logo de l'opérateur dans son profil.

## Étapes de génération d'une attestation PDF

1. [Création de l'attestation](#creation-de-l-attestation)  
   Sur la base des données d'identité fournies, les données de trajet liées à cette personne sont compilées et sauvegardées avec un identifiant unique qui permettra de récupérer et vérifier l'attestation.
2. [Téléchargement du PDF](#telecharger-une-attestation)  
   L'identifiant unique de l'attestation est utilisé pour générer un PDF imprimable. Les données stockées lors de la création de l'attestation sont mises en forme sur un document au format A4.

## **Création de l’attestation**

La requête est faite par le serveur de l’opérateur et authentifiée avec un token applicatif dans les _headers_ \(même token que pour envoyer des preuves\).

Chaque appel crée un nouveau certificat même si les paramètres sont exactement les mêmes, les valeurs calculées ont pu changer entre deux appels.

Les données sont calculées et stockées au moment de la création de l'attestation. Elles ne peuvent pas être modifiées. La génération du PDF, même si sa mise en forme peut évoluer, se basera toujours sur les mêmes données. La page de vérification

```javascript
POST /v2/certificates
Authorization: Bearer ${application_token}

Request {
    // Paramètres obligatoires

    // const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    "tz": "Europe/Paris",
    "identity": {
        "phone": "+33612345678"
        // OU
        "phone_trunc": "+336123456",
        "operator_user_id": "1111-222-333-4444"
    },

    // Paramètres optionnels
    "start_at": "2019-01-01T00:00:00Z",
    "end_at": "2019-12-31T23:59:59Z",
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

Response [201 Created] {
    "uuid": "8a9d2da9-39e3-4db7-be8e-12b4d2179fda",
    "created_at": "2020-01-01T00:00:00+0100",

    // données calculées pour l'attestation
    // peut permettre de faire un retour visuel à l'usager
    // sans avoir à télécharger le PDF.
    "meta": {
        "tz": "Europe/Paris",
        "rows": [
            {
                "index": 0,
                "month": "Juin 2020",
                "trips": 27,
                "distance": 147,
                "remaining": 0
            },
            ...
        ],
        "total_km": 0,         // distance
        "total_rm": 14.283,    // reste à charge
        "total_tr": 119,       // nb de trajets
        "total_point": 0       // nb de points
    }
}

Response [204 No Content] {
    "code": 204,
    "error": "No carpools for this period"
}

// invalid application_token
Response [401 Unauthorized] {
    "code": 401,
    "error": "Unauthorized"
}

// missing permission in the application_token scope
Response [403 Forbidden] {
    "code": 403,
    "error": "Forbidden"
}

Response [404 Not Found] {
    "code": 404,
    "error": "Not Found"
}
```

## Télécharger une attestation

Une fois l’attestation créée en base \(201 created\), on peut télécharger un PDF en y ajoutant des données permettant une identification simplifiée de la personne.

Ces meta-données optionnelles ne sont pas stockées sur nos serveurs, elles sont ajoutées au document généré à la volée.

En tant qu'opérateur, vous pouvez ajouter un logo à votre profile opérateur ([prod](https://app.covoiturage.beta.gouv.fr/admin/operator) / [démo](https://app.demo.covoiturage.beta.gouv.fr/admin/operator)) qui sera inséré sur le PDF.

Le PDF généré n'est pas stocké sur nos serveurs. L'appel d'API vous renvoie un fichier binaire que vous sauvegardez de votre côté. Vous pouvez générer la même attestation plusieurs fois de suite.

```javascript
POST /v2/certificates/pdf
Authorization: Bearer ${application_token}

Request {
    "uuid": "8a9d2da9-39e3-4db7-be8e-12b4d2179fda",
    // personnalisation optionnelle de l'en-tête
    // omettre 'meta' si pas de personnalisation
    // toutes les propriétés sont facultatives
    "meta": {
        "operator": {
            // zone de texte. Maximum de 305 caractères
            // Maximum de 6 lignes séparées par \n
            "content": "..."
        },
        "identity": {
            // Nom de la personne. Maximum de 26 caractères
            "name": "...",
            // zone de texte. Maximum de 305 caractères
            // Maximum de 6 lignes séparées par \n
            "content": "..."
        },
        // zone de texte. Maximum de 440 caractères
        // retour à la ligne auto.
        "notes": "..."
    }
}

Response [200 OK] { Buffer... }

Response [401 Unauthorized] {
    "code": 401,
    "error": "Unauthorized"
}

Response [404 Not Found] {
    "code": 404,
    "error": "Not Found"
}
```

Ci-dessous l'attestation avec les méta-données ajoutées au PDF.

- `operator.content` en **zone A**
- `identity.name` en **zone B**
- `identity.content` en **zone C**
- `notes` en **zone D**

## Exemples

#### Avec ou sans méta-données

![Attestations](/attestations.png)
