# Structure des données
Une fois le programme exécuté, vous obtiendrez trois tables :
- perimeters
- com_evolution
- dataset_migration
Seules les deux premières tables sont exploitables. 
La table dataset_migration ne sert qu'à conserver l'historique des migrations déjà réalisés.

## Table `perimeters`

La table principale qui contient les géométries ainsi que les données attributaires versionnées par années pour chaque commune ou chaque pays:
```sql
  CREATE TABLE IF NOT EXISTS perimeters (
    id SERIAL PRIMARY KEY,
    year SMALLINT NOT NULL, -- le millésime
    centroid GEOMETRY(POINT, 4326) NOT NULL, -- le chef lieu si la géométrie est une commune, le centroid sinon. La projection est en 4326
    geom GEOMETRY(MULTIPOLYGON, 4326) NOT NULL, -- le polygone non simplifié en projection 4326
    geom_simple GEOMETRY(MULTIPOLYGON, 4326) NOT NULL, -- le polygone simplifié en projection 4326 pour un usage web par exemple
    l_arr VARCHAR(256), -- le nom de l'arrondissement
    arr VARCHAR(5), -- le code insee de l'arrondissement
    l_com VARCHAR(256), -- le nom de la commune
    com VARCHAR(5), -- le code insee de la commune
    l_epci VARCHAR(256), -- le nom de l'epci 
    epci VARCHAR(9), -- le code insee de l'epci
    l_dep VARCHAR(256), -- le nom du département
    dep VARCHAR(3), -- le code insee du département
    l_reg VARCHAR(256), -- le nom de la région
    reg VARCHAR(2), -- le code insee de la région
    l_country VARCHAR(256), -- le nom du pays
    country VARCHAR(5), -- le code insee du pays
    l_aom VARCHAR(256), -- le nom de l'aom
    aom VARCHAR(9), -- le code siren de l'aom
    l_reseau VARCHAR(256) -- le nom du réseau de transport
    reseau INT, -- le code du réseau de transport
    pop INT, -- la population
    surface FLOAT(4) -- la surface calculé à partir du champ geom (en km2)
  );
```
Les index sont les suivants :
  - id
  - centroid
  - geom
  - geom_simple

## Table `com_evolution`

La table de passage qui permet de suivre l'historique des modifications apportés au Code officiel géographique de l'INSEE pour les communes françaises depuis 2019 :
```sql
  CREATE TABLE IF NOT EXISTS com_evolution (
    year SMALLINT NOT NULL, -- le millésime
    mod SMALLINT NOT NULL, -- le code de la modification
    old_com VARCHAR(5), -- l'ancien code insee
    new_com VARCHAR(5), -- le nouveau code insee
    l_mod VARCHAR -- le nom de la modification
  );
```

Les index sont les suivants :
  - mod
  - old_com
  - new_com

Une ligne correspond au changement de code INSEE d'une commune applicable au 1er janvier du millésime indiqué.
Ainsi dans l'exemple ci-dessous:
| year | mod | old_com  | new_com | l_mod                          |
|------|-----|----------|---------|--------------------------------|
| 2019 | 32  |	"01091" |	"01033" |	"création de commune nouvelle" |

La commune dont le code insee est 01091 (Châtillon-en-Michaille) à intégrée au 01/01/2019 la commune nouvelle dont le code insee est 01033 (Valserhône)

Les différentes modalités de changement de code INSEE pour une commune sont : 
| mod | l_mod                                                |
|-----|------------------------------------------------------|
| 20  | création                                             |
| 21  | rétablissement                                       |
| 30  | suppression                                          |
| 31  | fusion simple                                        |
| 32  | création de commune nouvelle                         |
| 33  | fusion association                                   |
| 41  | Changement de code dû à un changement de département |
| 50  | Changement de code dû à un transfert de chef-lieu    |

## Table `dataset_migration`

La table qui contient l'historique des datasets dont la migration a déjà été réalisée.
```sql
CREATE TABLE IF NOT EXISTS dataset_migration
(
    key VARCHAR(128) NOT NULL, -- L'identifiant du dataset migré.
    datetime timestamp without time zone NOT NULL DEFAULT now()
)
```
Une ligne correspond à un dataset migré.