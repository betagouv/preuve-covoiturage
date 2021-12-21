# Télécharger une attestation

## Upload du logo opérateur

Vous pouvez personnaliser le logo opérateur présent sur l'attestation.

Contrairement aux meta-données envoyées lors de la création de l'attestation, le logo est configuré au préalable via le page de profil de votre opérateur.

- [Ajouter mon logo en production](https://app.covoiturage.beta.gouv.fr/admin/operator)
- [Ajouter mon logo pour les tests](https://app.demo.covoiturage.beta.gouv.fr/admin/operator)

> _Le poids de l'image est de 2Mo maximum et sa taille de 1024x1024 pixels._

## Téléchargement

Une fois l’attestation créée en base \(201 created\), on peut télécharger un PDF en y ajoutant des données permettant une identification simplifiée de la personne.

Ces meta-données optionnelles ne sont pas stockées sur nos serveurs, elles sont ajoutées au document généré à la volée.

Le PDF généré n'est pas stocké sur nos serveurs. L'appel d'API vous renvoie un fichier binaire que vous sauvegardez de votre côté. Vous pouvez générer le PDF d'une attestation plusieurs fois de suite.

## Requête sans meta-données

```javascript
POST /v2/certificates/pdf
Authorization: Bearer ${application_token}

Request {
    "uuid": "8a9d2da9-39e3-4db7-be8e-12b4d2179fda"
}
```

## Requête avec meta-données

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
```

## Codes réponse

### Attestion générée

Le fichier binaire est renvoyé

```js
Response [200 OK] { Buffer... }

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

### Attestation non trouvée

L'attestation n'existe pas.

```js
Response [404 Not Found] {
    "code": 404,
    "error": "Not Found"
}
```

## Exemples

#### Avec ou sans méta-données

![Attestations](/attestations.png)
