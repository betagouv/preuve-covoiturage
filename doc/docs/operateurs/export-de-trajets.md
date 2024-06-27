# Export de trajets

## API

- `POST   /v3/export`
- `GET    /v3/export`
- `GET    /v3/export/:id`
- `DELETE /v3/export/:id`
- `GET    /v3/export/:id/status`
- `GET    /v3/export/:id/download`

La spécification OpenAPI complète de l'API est disponible sur [la documentation API V3](/operateurs/api-v3.html).

#### Authentification et Autorisations

Les appels sont authentifiés par un token applicatif. Les permissions du token doivent contenir les scopes suivants :

- `export.create` pour la création d'un nouvel export
- `export.list` pour accéder à la liste de ses exports
- `export.read` pour accéder à un export en particulier
- `export.status` pour accéder au statut d'un export
- `export.cancel` pour annuler un export
- `export.download` pour télécharger un export

> Vous pouvez générer un nouveau token applicatif afin qu'il ai les permissions nécessaires pour utiliser cette API.
> 
> [https://app.covoiturage.beta.gouv.fr/admin/api](https://app.covoiturage.beta.gouv.fr/admin/api)

#### Règles

- L'utilisateur ne peut lister que ses propres exports.
- Il n'est pas possible de gérer les exports de son organisation (opérateur ou territoire).
- Tous les rôles ont accès à l'export de trajets.

## CLI (interne)

> Cette fonctionnalité est réservée aux administrateurs de l'application.

#### Définitions

- `Territory` : Territoire
- `Operator` : Opérateur
- `Export` : Export de trajets
- `Creator` : Créateur de l'export
- `Recipient` : Destinataire de l'export

## Confidentialité des données

Les exports de trajets contiennent des données personnelles et sensibles. Ils doivent être manipulés avec précaution et stockés de manière sécurisée.

La durée de conservation des fichiers générés est limitée à 7 jours. Passé ce délai, les fichiers sont automatiquement supprimés et les données personnelles des utilisateurs anonymisées.

## Données ouvertes

Les données de trajets sont accessibles en open data sur le site [data.gouv.fr](https://www.data.gouv.fr/fr/datasets/trajets-realises-en-covoiturage-registre-de-preuve-de-covoiturage/). Elles sont exportées chaque mois au format CSV.

Depuis le ..., le format de données est passé en Version 3 pour intégrer de nouvelles informations. Les données sont désormais exportées au format XLSX.

## Schema de données

### V3 - XLSX

<!-- Nouvelle version en XLSX mappée sur l'API v3 -->
<!-- opendata / opérateur / territoire -->

### V2 - CSV

<!-- Version actuelle en CSV -->
<!-- Format opendata + champs spécifiques si opérateur ou territoire -->
