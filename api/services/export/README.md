---
title: Service export
---

Export des trajets (carpools) avec filtres territoire, opérateurs et géo. L'export est "commandé" et executé en arrière plan par un worker lancé chaque minute.

Les demandes d'export sont stockées dans une table `exports` avec un statut `pending` et un identifiant unique `uuid`. L'utilisateur peut suivre l'état de l'export avec l'identifiant `uuid` et télécharger le fichier une fois l'export terminé.

Les exports expirent après un délai fixé en configuration. Les données personnelles sont alors anonymisées en remplaçant les données email, fullname et message par des données aléatoires dans la table `recipients` et les fichiers XLSX/ZIP sont supprimés du S3 (tâche de nettoyage du bucket).

Des points d'API (clients et admins) et des commandes (admins) permettent de créer, lister, annuler et télécharger les exports.

Les exports Open-data sont gérés uniquement par le CLI.

Les actions sur les exports sont enregistrées dans la table `logs` pour garder une traçabilité.

### Spec

- format XLSX
- export configurable
- anonymisation open-data

> ### Commandes existantes
>
> - `trip:replayOpendata` #TODO analyser l'utilisation
>   - uses `trip:buildExport`
> - `trip:publish` #TODO analyser l'utilisation
>   - uses `trip:buildExport`
>
> ### Actions existantes
>
> - `trip:export` ->  `trip:sendExport` -> `trip:buildExport`
> - `trip:publishOpenData`

### Actions utilisateur

- `create` (create)
- `status` (read)
- `list` (read list of exports filtered by `created_by`)
- `process` (process des exports en `pending`)
- `cancel` (annule une demande)
- `download` (create download link and redirect)
- `send` (create download link and send email from template)

### Commandes utilisateur

- `export:create`: crée une demande d'export
- `export:status`: retourne le statut d'un export
- `export:list`: liste les exports
- `export:cancel`: annule une demande d'export
- `export:download`: télécharge un export
- `export:send`: envoi un export par email
- `export:process`: process des exports en `pending` (CRON)
- `opendata:create`: crée un export open-data
- `opendata:upload`: upload un export open-data sur le S3
- `opendata:publish`: crée et upload un export open-data (CRON)

### CRON jobs

`* * * * * export:process`

- Expiration des process avec scrambling des données personnelles après le délai d'expiration fixé en configuration
- Process des exports en `pending`

`* * * * * opendata:publish`

- crée l'export open-data
- upload sur data.gouv.fr

### Steps

1. Collecter les inputs utilisateur -> stocker dans un table d'exports
2. CRON job toutes les minutes qui process et envoie les exports
3. Charger les fichiers de config des campagnes pour avoir accès aux tranches / périodes normales ou booster
4. Définir si on fait un export normal ou open-data
5. Streamer les données de la base -> transform -> enrich -> write dans le fichier XLSX
6. Zipper le XSLX
7. Upload sur le S3
8. Envoi du mail

### Structures de données

##### Table `export.exports`

```
_id
created_at
updated_at
created_by
uuid
status (pending|processing|uploading|sending|error|expired)
progress (0 - 100)
type (regular|opendata|operator|territory|registry)
download_url
params
error
stats
```

##### Table `export.recipients`

Table one-to-many des destinataires

```
_id
scrambled_at
export_id
email
fullname
message
```

##### Table `export.logs`

```
_id
created_at
export_id
type (=status|)
message
```

En cas d'erreur :

- notifier l'utilisateur
- notifier l'administration technique du site

# TODO

- [ ] gérer les champs en fonction du type d'export (config)
- [ ] tester les repositories
- [ ] migrations
- [ ] tests
- [ ] models (export, recipient, log)
- [ ] validation (schemas)
- [ ] permissions
- [ ] actions
- [ ] commands
- [ ] CRON jobs (infra)
