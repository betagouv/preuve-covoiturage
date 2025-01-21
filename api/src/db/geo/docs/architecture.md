# Architecture

## Organisation

```shell
db/geo
├── docs
├── common
│   ├── AbstractDataset.ts
│   ├── AbstractDatastructure.ts
│   ├── AbstractDatafunction.ts
│   ├── AbstractDatatreatment.ts
│   ├── index.ts
│   └── Migrator.ts
├── config.ts
├── datasets
│   ├── [producer]
│   │   └── [dataset]
│   │       ├── [year]
│   │       │   ├── ProducerDatasetYYYY.spec.ts
│   │       │   └── ProducerDatasetYYYY.ts
├── datastructure
│   ├── 000_CreateGeoTable.ts
│   └── 001_CreateComEvolutionTable.ts
├── errors
├── helpers
│   ├── bootstrap
│   ├── data
│   ├── file
├── interfaces
└── providers
    ├── DatabaseStateManager.ts
    ├── FileManager.ts
    └── MemoryStateManager.ts
```

- le répertoire `docs` contient la documentation (dont ce fichier)
- le répertoire `common` contient les classes abstraites communes aux datasets
- le répertoire `datasets` contient les datasets organisés sous la forme `{producteur}/{dataset}/{millesime}`
- le répertoire `datastructure` contient les migrations de tables finales
- le répertoire `datafunctions` contient les fonctions à ajouter au schéma de la base de données
- le répertoire `datatreatments` contient les migrations de post-traitements sur les tables finales (ex: création de centroides pour les territoires > à la maille communale)
- le répertoire `errors` contient les erreurs personnalisées
- le répertoire `helpers` est organisé de la manière suivante :
  - à la racine les helpers génériques, notamment pour instancier les providers
  - `bootstap` sont les helpers liés à la récupération des erreurs et au logging
  - `data` sont les helpers liés à la manipulation de données
  - `file` sont les helpers liés à la manipulation de fichier
- le répertoire `interfaces` contient les interfaces
- le répertoire `providers` contient les providers et notamment le DatabaseStateManager et le FileManager détaillé ci-après
- enfin le fichier `config.ts` contient la configuration par défaut de l'application
- le fichier `Migrator.ts` est l'orchestrateur qui va jouer les différents datasets

## Migrator

La classe `Migrator` est l'orchestrateur des datasets : c'est elle qui joue les
datasets, qui les instancients et gère leur l'état. Pour ce faire, elle doit
être construite avec :

- une `Pool` postresql
- un `FileManager`
- un `DatabaseStateManager`
- une configuration

## FileManager

La classe `FileManager` gère la manipulation de fichier : télécharger,
décompresser, transformer.

## StateManager

Le StateManager est découpé en deux classes :

- `DatabaseStateManager` : permet d'instancier une classe `MemoryStateManager` à
  partir de la base de données postgresql et vice-versa ;
- `MemoryStateManager` : gère l'état des datasets (planned, done, etc.).
