# Architecture

## Organisation
```
.
├── db
├── docker
│   ├── etl
│   │   └── Dockerfile
│   └── postgres
│       ├── Dockerfile
│       ├── initdb-postgis.sh
│       └── update-postgis.sh
├── docker-compose.yml
├── docs
├── etl
│   ├── src
│   │   ├── common
│   │   │   ├── AbstractDataset.ts
│   │   │   ├── AbstractDatastructure.ts
│   │   │   ├── AbstractDatafunction.ts
│   │   │   ├── AbstractDatatreatment.ts
│   │   │   ├── index.ts
│   │   │   └── Migrator.ts
│   │   ├── config.ts
│   │   ├── datasets
│   │   │   ├── [producer]
│   │   │   │   └── [dataset]
│   │   │   │       ├── [year]
│   │   │   │       │   ├── ProducerDatasetYYYY.spec.ts
│   │   │   │       │   └── ProducerDatasetYYYY.ts
│   │   ├── datastructure
│   │   │   ├── 000_CreateGeoTable.ts
│   │   │   └── 001_CreateComEvolutionTable.ts
│   │   ├── errors
│   │   ├── helpers
│   │   │   ├── bootstrap
│   │   │   ├── data
│   │   │   ├── file
│   │   ├── interfaces
│   │   └── providers
│   │       ├── DatabaseStateManager.ts
│   │       ├── FileManager.ts
│   │       └── MemoryStateManager.ts
```

- le répertoire `docker` et et le fichier `docker-compose.yml` sont utilisés pour le développement local et les tests
- le répertoire `docs` contient la documentation (dont ce fichier)
- le répertoire `etl/src/common` contient les classes abstraites communes aux datasets
- le répertoire `etl/src/datasets` contient les datasets organisés sous la forme `producteur_de_données/jeux_de_données/millésime`
- le répertoire `etl/src/datastructure` contient les migrations de tables finales
- le répertoire `etl/src/datafunctions` contient les fonctions à ajouter au schéma de la base de données
- le répertoire `etl/src/datatreatments` contient les migrations de post-traitements sur les tables finales (ex: création de centroides pour les territoires > à la maille communale)
- le répertoire `etl/src/errors` contient les erreurs personnalisées
- le répertoire `etl/src/helpers` est organisé de la manière suivante :
  - à la racine les helpers génériques, notamment pour instancier les providers
  - `bootstap` sont les helpers liés à la récupération des erreurs et au logging
  - `data` sont les helpers liés à la manipulation de données
  - `file` sont les helpers liés à la manipulation de fichier
- le répertoire `etl/src/interfaces` contient les interfaces
- le répertoire `etl/src/providers` contient les providers et notamment le DatabaseStateManager et le FileManager détaillé ci-après
- enfin le fichier `etl/src/config.ts` contient la configuration par défaut de l'application
- le fichier `etl/src/Migrator.ts` est l'orchestrateur qui va jouer les différents datasets

## Librairies utilisées

Le paquet utilise comme dépendances :
- [axios](https://github.com/axios/axios) : pour faire les requête http
- [commander](https://github.com/tj/commander.js/) : pour la ligne de commande (parser les arguments, fournir l'aide)
- [pg](https://github.com/brianc/node-postgres) : pour requêter la base de données postgresql

Pour la manipulation d'archive :
- [extract-zip](https://github.com/maxogden/extract-zip) : pour les archives zip
- [node-7z](https://github.com/quentinrossetti/node-7z) : pour les archives 7zip

Pour la manipulation de fichiers :
- [csv-parse](https://github.com/adaltas/node-csv) : pour les fichiers csv
- [stream-json](https://github.com/uhop/stream-json) : pour les fichier json
- [xlsx](https://github.com/SheetJS/sheetjs) : pour les fichiers xlsx

Pour la manipulation des données :
- [mapshaper](https://github.com/mbloch/mapshaper) : pour simplifier les formes géométriques et transformer les fichiers shp en geojson 

## Migrator

La classe `Migrator` est l'orchestrateur des datasets : c'est elle qui joue les datasets, qui les instancients et gère leur l'état. Pour ce faire, elle doit être construite avec :
- une `Pool` postresql
- un `FileManager`
- un `DatabaseStateManager`
- une configuration

## FileManager

La classe `FileManager` gère la manipulation de fichier : télécharger, décompresser, transformer.

## StateManager

Le StateManager est découpé en deux classes :
- `DatabaseStateManager` : permet d'instancier une classe `MemoryStateManager` à partir de la base de données postgresql et vice-versa ;
- `MemoryStateManager` : gère l'état des datasets (planned, done, etc.).

