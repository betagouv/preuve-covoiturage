# Utilisation avancée

Au lieu d'utiliser la ligne de commande pour éxécuter l'intégralité des
migrations, vous avez la possibilité en utilisant "Évolutions-geo" comme
dépendance de votre projet de jouer uniquement certains datasets, d'en créer de
nouveaux ou de commander les migrations de manière fonctionnelle.

## Types de datasets

La logique du programme est de construire des tables finales agrégeant les
données de tables intermédiaires (une par source et millésime de données) qui
seront supprimées (ou non) en fin de parcours. Chaque table est donc décrite
dans une classe `dataset` qui contient les différentes propriétés et méthodes
permettant les différentes étapes du traitement des données (téléchargement,
creation des tables, transformation des données, etc...). Nous avons donc conçu
les interfaces `StaticMigrable` et `DatasetInterface` qui doivent être
implémentés dans chaque `dataset`:

```typescript=
interface StaticMigrable {
  // la clé utilisée pour savoir si le dataset a été joué
  static readonly uuid: string;
  // la table intermédiaire du dataset
  static readonly table: string;
  // le millésime du dataset
  static readonly year: number;
  // le dataset doit-il être jouer à chaque exécution ou une seule fois  
  static readonly skipStatePersistence?: boolean;
  // pour construire la classe, elle reçoit une connexion pool Postgresql, un file provider et un schema sql sur lequel se positionner
  static new (connection: Pool, file: FileManager, targetSchema: string): DatasetInterface;
  // permet de planifier des datasets dépendants les uns des autres
  }
  interface DatasetInterface {
  validate(state: StateManagerInterface): Promise<void>;
  // permet de créer les table intermédiaire
  before(): Promise<void>;
  // permet de gérer le téléchargement
  download(): Promise<void>;
  // permet la transformation du datasets
  transform(): Promise<void>;
  // charge les données dans la table intermédiaire
  load(): Promise<void>;
  // importe les données dans les tables finales
  import(): Promise<void>;
  // détruit les tables intermédiaires
  after(): Promise<void>;
}
```

Néanmoins, afin de faciliter l'implémentation, nous avons créé 4 classes
abstraites `AbstractDatastructure`, `AbstractDataset`, `AbstractDatafunction` et
`AbstractDatatreatment` afin de gérer les types de datasets dont nous avions
besoin. Libre à vous de surcharger les différentes méthodes pour répondre à
votre besoin. Vous pouvez étendre `AbstractDatastructure` en créant de nouvelles
classes pour créer les datasets correspondants aux tables finales. Vous pouvez
étendre `AbstractDataset` en créant de nouvelles classes pour créer les datasets
correspondants aux tables intermédiaires. Vous pouvez étendre
`AbstractDatafunction` en créant de nouvelles classes pour créer les datasets
correspondants aux fonctions que vous souhaitez ajouter à la base de données.
Vous pouvez étendre `AbstractDatatreatment` en créant de nouvelles classes pour
créer les datasets correspondants à des post-traitements utilisant les données
de tables finales.

## Jouer tous les datasets

```typescript=
import { datasets, StaticMigrable } from '@betagouvpdc/perimeters.ts';

async function main(): Promise<void> {
    const allDatasets:Set<StaticMigrable> = datasets.datasets;
    const migrator = buildMigrator({ app: { migrations: allDatasets }});
    await migrator.prepare();
    await migrator.run();
}
```

## Personnaliser la liste des datasets

Attention, les datasets créant les tables finales doivent se positionner avant
les datasets de tables intermédiaires les alimentants.

```typescript=
import { StaticMigrable } from '@betagouvpdc/perimeters.ts';
import { CreateGeoTable } from '@betagouvpdc/perimeters/dist/datastructure/000_CreateGeoTable.ts';

async function main(): Promise<void> {
    const allDatasets:Set<StaticMigrable> = new Set([
      CreateGeoTable,
    ]);
    const migrator = buildMigrator({ app: { migrations: allDatasets }});
    await migrator.prepare();
    await migrator.run();
}
```

## Créer un nouveau dataset

Pour faciliter l'implémentation, il existe deux classes abstraites qui gèrent la
plupart des cas, vous pouvez les étendre de la façon suivante :

### Pour la classe abstraite `AbstractDataset` :

```typescript=
import { AbstractDataset, ArchiveFileTypeEnum, FileTypeEnum } from '@betagouvpdc/evolution-geo.ts';

export class MyDataset extends AbstractDataset {
  // nom du producteur de la donnée
  static producer = 'insee'; 

  // nom du dataset
  static dataset = 'com'; 

  // année du millésime
  static year = 2021; 

  // nom de la table intermédiaire
  static table = 'insee_com_2021'; 

  // nom de la table finale (optionnel, la valeur par défaut est 'perimeters')
  readonly targetTable = 'perimeters'

  // url du fichier ou de l'archive source
  readonly url: string = 'https://www.insee.fr/fr/statistiques/fichier/5057840/commune2021-csv.zip';

  // type de l'archive source (Zip, GZip, SevenZip ou None) 
  readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.Zip; 

  /* Description du mapping entre les colonnes de la table intermédiaire et les colonnes du ou des fichier(s) traité(s).
    L'objet Map servira également à la création de la table intermédiaire et doit être rempli de la façon suivante :
    ['Nom de la colonne dans la table intermédiaire',['Nom ou numero de la colonne dans le fichier','Type souhaité dans la table intermédiaire']]
    Vous n'êtes pas obligé de décrire toutes les colonnes d'un fichier, seules les colonnes souhaités doivent être décrites.
  */
  readonly rows: Map<string, [string, string]> = new Map([
    ['typecom', ['0', 'varchar(4)']],
    ['arr', ['1', 'varchar(5)']],
    ['libelle', ['9', 'varchar']],
    ['com', ['11', 'varchar(5)']],
  ]);

  // Exploitation du hook permettant d'éxécuter une requête sql après la création de la table intermédaire (pour modifier la table, rajouter des indexs, etc...).
  readonly extraBeforeSql = `ALTER TABLE ${this.tableWithSchema} ALTER COLUMN arr SET NOT NULL;`;

  // type du ou des fichiers sources (Csv, Ods, Xls, Geojson ou Shp)
  fileType: FileTypeEnum = FileTypeEnum.Csv;

  // options de configuration des librairies permettant de parser les fichiers. Se référer à la documentation des librairies utilisés décrite dans /docs/architecture.md
  sheetOptions = {
    delimiter: ','
  };

  // nom de la colonne sur laquelle l'index principal de la table sera créé (en utilisant btree). Il n'y aura pas d'index en cas d'absence de la variable.
  readonly tableIndex = 'arr';

  // Requête sql permettant l'importation de la table intermediaire dans la table finale.
  readonly importSql = `
    UPDATE ${this.targetTableWithSchema} AS a
      SET l_arr = t.libelle, com = t.com
    FROM ${this.tableWithSchema} t
    WHERE a.arr = t.arr AND t.typecom = 'ARM';
  `;
}
```

### Pour la classe abstraite `AbstractDatastructure` :

```typescript=
import { AbstractDatastructure } from '@betagouvpdc/evolution-geo.ts';
export class MyDataset extends AbstractDatastructure {
  // identifiant unique de la table pour l'orchestrateur
  static uuid = 'create_my_table';
  
  // nom de la table finale
  static table = 'perimeters';

  // Permet de construire le nom des indexs
  readonly indexWithSchema = this.tableWithSchema.replace('.', '_');

  // requête sql de création de la table
  readonly sql = `
    CREATE EXTENSION IF NOT EXISTS postgis;
    CREATE TABLE IF NOT EXISTS ${this.tableWithSchema} (
        id SERIAL PRIMARY KEY,
        year SMALLINT NOT NULL,
        centroid GEOMETRY(POINT, 4326) NOT NULL,
        geom GEOMETRY(MULTIPOLYGON, 4326) NOT NULL,
        geom_simple GEOMETRY(MULTIPOLYGON, 4326) NOT NULL,
        l_arr VARCHAR(256),
        arr VARCHAR(5),
        l_com VARCHAR(256),
        com VARCHAR(5),
        l_epci VARCHAR(256),
        epci VARCHAR(9),
        l_dep VARCHAR(256),
        dep VARCHAR(3),
        l_reg VARCHAR(256),
        reg VARCHAR(2),
        l_country VARCHAR(256),
        country VARCHAR(5),
        l_aom VARCHAR(256),
        aom VARCHAR(9),
        l_reseau VARCHAR(256),
        reseau INT,
        pop INT,
        surface FLOAT(4)
    );
    CREATE INDEX IF NOT EXISTS ${this.indexWithSchema}_id_index 
    ON ${this.tableWithSchema} USING btree (id);
    CREATE INDEX IF NOT EXISTS ${this.indexWithSchema}_centroid_index 
    ON ${this.tableWithSchema} USING gist (centroid);
    CREATE INDEX IF NOT EXISTS ${this.indexWithSchema}_geom_index 
    ON ${this.tableWithSchema} USING gist (geom);
    CREATE INDEX IF NOT EXISTS ${this.indexWithSchema}_geom_simple_index 
    ON ${this.tableWithSchema} USING gist (geom_simple);
  `;
}
```

### Cas d'un dataset avec des données geographiques

Vous pouvez vous inspirer ou étendre la classe abstraite
[IgnDataset](/src/datasets/ign/common/IgnDataset.ts) de la façon suivante :

```typescript=
import { IgnDataset } from '@betagouvpdc/perimeters/dist/datasets/ign/common/IgnDataset.ts';
export class MyGeoDataset extends IgnDataset {
  // nom du producteur de la donnée
  static producer = 'ign'; 

  // nom du dataset
  static dataset = 'my_geo_dataset'; 

  // année du millésime
  static year = 2019; 

  // nom de la table intermédiaire
  static table = 'my_geo_2019'; 

  // nom de la table finale (optionnel, la valeur par défaut est 'perimeters')
  readonly targetTable = 'perimeters'

  // Permet de construire le nom des indexs
  readonly indexWithSchema = this.tableWithSchema.replace('.', '_');

  // Requête sql de création de la table et des indexs
  readonly beforeSql: string = `
    CREATE TABLE IF NOT EXISTS ${this.tableWithSchema} (
      id SERIAL PRIMARY KEY,
      geom geometry(MULTIPOLYGON,4326)
    );
    CREATE INDEX IF NOT EXISTS ${this.indexWithSchema}_id_index ON ${this.tableWithSchema} USING btree (id);
    CREATE INDEX IF NOT EXISTS ${this.indexWithSchema}_geom_index ON ${this.tableWithSchema} USING gist (geom);
  `;

  // url du fichier ou de l'archive source
  readonly url: string = ''http://files.opendatarchives.fr/professionnels.ign.fr/adminexpress/ADMIN-EXPRESS-COG_2-0__SHP__FRA_WGS84G_2019-09-24.7z';

  // type de l'archive source (Zip, GZip, SevenZip ou None) 
  readonly fileArchiveType: ArchiveFileTypeEnum = ArchiveFileTypeEnum.SevenZip;

  // type du ou des fichiers sources (Geojson ou Shp)
  fileType: FileTypeEnum = FileTypeEnum.Shp;

  /* Transformations réalisées avec Mapshaper (conversion des shp en geojson ou simplification des géométries)
    Chaque ligne du tableau pilote une transformation de la façon suivante :
    [
      'nom du fichier à transformer',
      {
        key: '', //nom de la geometrie transformée.
        format: 'geojson', // format du fichier obtenu.
        precision: 0.000001, // précision de la géométrie.
        force: false, // permet d'écraser un fichier existant afin de faire des simplifications en cascade.
        simplify: [], // commande mapshaper de simplification des géometries. Se référer à sa documentation.
      }
    ]
}]
  readonly transformations: Array<[string, Partial<TransformationParamsInterface>]> = [
    ['COMMUNE_CARTO.shp', { key: 'geom', simplify: ['-simplify dp interval=100 keep-shapes'] }],
  ];

  // Requête sql d'importation dans la table finale
  readonly importSql = `
    INSERT INTO ${this.targetTableWithSchema} (
      geom
    ) SELECT
      geom
    FROM ${this.tableWithSchema}
    ON CONFLICT DO NOTHING;
  `;
}
```

## Utiliser le nouveau dataset

```typescript=
import { buildMigrator, datasets } from '@betagouvpdc/perimeters.ts';
import { MyDataset } from './MyDataset.ts';

async function main(): Promise<void> {
    datasets.datasets.add(MyDataset);
    const migrator = buildMigrator({ app: { migrations: datasets.datasets }});
    await migrator.prepare();
    await migrator.run();
}
```
