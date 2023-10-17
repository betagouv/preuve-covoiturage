---
title: APDF
---

# Service APDF

Le service APDF gère les Appels de Fonds (APDF) compilés chaque mois sous forme de fichiers XLSX.  
Les APDF permettent aux opérateurs de covoiturage de justifier des montants d'incitation distribués aux covoitureurs et covoitureuses auprès des territoires qui ont mis en place les campagnes.

Le fichier comporte une liste de tous les trajets du mois dans un onglet et un récapitulatif par tranches (voir ci-dessous).  
La liste affiche les trajets incités, non incités quelques soit leur distance.

### Gestion des tranches

Les campagnes peuvent avoir des tarifs différents en fonction de la distance du trajet. Il est possible de configurer des _« tranches »_ qui apparaitront dans un onglet spécifique de l'export.

Par exemple, une campagne a 2 tranches :

1. de 2km à 20km
2. de 20km à 50km

L'onglet _« tranches »_ de l'export comportera les informations pour ces deux tranches mais aussi un récapitulatif des trajets hors-tranches de 0 à 2km et de 50km et plus.

## Configuration

#### `APP_APDF_SHOW_LAST_MONTH`

`type: boolean`  
`default: true`

Permet de cacher les fichiers générés pour le dernier mois afin d'effectuer des vérifications avant leur publication.

#### `APP_APDF_S3_UPLOAD_ENABLED`

`type: boolean`  
`default: false`

Bloque l'upload des fichiers vers le S3 une fois qu'ils sont générés. Les fichiers sont conservés dans le dossier `./tmp` qui est monté à la racine du projet par le `docker-compose.yml`.  
Attention, les permissions doivent être corrigées pour pouvoir ouvrir les .xlsx

```
sudo chown -R $USER: ./tmp
```

## Actions

### Liste

Liste les fichiers d'APDF téléchargeables par campagne et par opérateur. Les fichiers sont stockés dans un bucket S3 et l'API S3 est utilisée pour lister les objets. Les informations d'affichage sont serialisées dans le nom du fichier.

Le bucket S3 est privé et des liens de téléchargement avec un token sont générés à chaque affichage pour rendre l'accès au fichier possible.

Les fichiers générés avec les même noms remplacent les anciens.

### Export

Compilation des fichiers XLSX pour un mois donné. Les fichiers sont générés pour les opérateurs actifs, c'est à dire qu'ils ont des trajets incités dans le mois.

Les exports sont programmés pour être calculés le 6 de chaque mois.
## Commandes

### Export : `npm run ilos apdf:export`

Exporte les APDF et upload les fichiers sur le S3.

```
Options:
  (sans options: export le mois précédent, toutes campagnes, tous opérateurs)

  -c / --campaigns            Liste des id des campagnes à exporter séparés
                              par des virgules
  -o / --operators            Liste des id des opérateurs séparés par des
                              virgules
  -s / --start                Date de début (inclusive) au format ISO
                              ex: 2022-12-01
  -e / --end                  Date de fin (exclusive) au format ISO
                              ex: 2023-01-01
  --tz                        Fuseau horaire pour l'affichage des dates.
                              Par défaut : Europe/Paris
  --verbose                   Afficher des informations de debug dans la console
  --sync                      Executer la commande directement et non 
                              dans le `worker`.
```

> **Note sur les dates**
>
> Lorsque le fuseau horaire n'est pas précisé pour les entrées (`-s`, `-e`), l'heure locale est utilisée (Europe/Paris).  
> Il est possible de passer une date complète au format ISO, par exemple `2022-12-01T00:00:00+0100`.
> 
> Les dates en sortie (dans le fichier) seront converties dans le fuseau horaire précisé par `--tz`.

> **Note sur `--sync`
>
> La génération des APDF prenant plus de temps, la commande programme l'execution de la tâche par la queue.
>
> Quand `--sync` est utilisé (en local, par exemple). Il est conseillé de passer les timeouts à 0 :
> ```
> APP_REQUEST_TIMEOUT=0 APP_POSTGRES_TIMEOUT=0 npm run ilos apdf:export
> ```
> ou  
> ```
> # .env file
> APP_REQUEST_TIMEOUT=0
> APP_POSTGRES_TIMEOUT=0 
> ```
#### Exemples

```
# Export de toutes les campagnes pour tous les opérateurs, le mois dernier
# (commande executée en CRON)
npm run ilos apdf:export

# Sur le mois de janvier 2023
npm run ilos apdf:export -s 2023-01-01 -e 2023-02-01

# Pour un opérateur spécifique
npm run ilos apdf:export -o 1
```

> Lors de tests ou d'export en local, on peut suffixer la commande avec ` | pino-pretty -f` pour avoir une console plus lisible.  
> Pour l'installer : `npm i -g pino-pretty`