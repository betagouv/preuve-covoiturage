# Datasets
Chaque répertoire du répertoire `datasets` correspond à un fournisseur de données.
Les répertoires de niveau n-1 correspondent à un jeu de données. 
Les répertoires de niveau n-2 correspondent à un millésime du jeu de données.
Le nom du dataset est la concaténation de ces 3 informations.
Afin de garantir la pérennité des données, nous avons ajouté un système de sauvegarde des fichiers associés aux datasets inclus dans le projet. En cas d'échec de téléchargement d'un fichier, il sera récupérer automatiquement depuis le mirror mis en place dans l'infrastructure du RPC.

## [CEREMA](https://www.cerema.fr/)
Le jeu de données correspond aux fichiers Excel décrivant les Autorités organisatrices de la mobilité.
Les Datasets intégrent les codes aom et id_reseau dans la table `perimeters` (le code aom correspond au code siren de ce jeu de données)  
```
├── cerema
│   └── aom
│       ├── 2019
│       │   └── CeremaAom2019.ts 
│       ├── 2020
│       │   └── CeremaAom2020.ts
│       ├── 2021
│       │   └── CeremaAom2021.ts
│       └── 2022
│           └── CeremaAom2022.ts
```

## Direction générale des collectivités locales
Le jeu de données correspond au fichier Excel [Banatic] (https://www.banatic.interieur.gouv.fr/V5/accueil/index.php) qui décrit les catégories d'intercommunalité.
Le Dataset intégrent les noms des autorités organisatrices de la mobilité (l_aom) dans la table `perimeters` et permet d'associer le code aom des régions (identique au code siren de la région) pour les communes n'ayant pas pris la compétence transport.
```
├── dgcl
│   └── banatic
│       ├── 2021
│       │   └── DgclBanatic2021.ts
│       ├── 2022
│       │   └── DgclBanatic2022.ts
│       └── common
│           └── DgclBanaticDataset.ts
```
## Commission européenne
Le jeu de données correspond au fichier JSON des [géométries des pays du monde](https://gisco-services.ec.europa.eu/distribution/v2/countries/).
Le dernier millésime disponible est celui de 2020. Le jeu de données est mis à jour en moyenne tous les 4 à 5 ans.
Le dataset n'intégre aucune données mais il est une dépendance du dataset InseePays2021 afin d'obtenir la correspondance entre la nomenclature INSEE des codes pays et la nomenclature internationale (ISO 3166‑1 alpha‑3) et les données geometriques.
```
├── eurostat
│   └── countries
│       └── 2020
│           └── EurostatCountries2020.ts
```
## IGN (Institut géographique national)
Le jeu de données correspond aux fichiers (SHP) [Admin-Express](https://geoservices.ign.fr/adminexpress) qui décrivent le découpage administratif du territoire métropolitain et des Départements et Régions d’Outre-Mer.
Les datasets intégrent le code arrondissement (arr), la population(pop), les géométries (geom), les chefs-lieux (centroid) et calculent les géométries simplifiés (geom_simple) et la surface des communes et des arrondissements dans la table `perimeters`.
```
├── ign
│   ├── admin_express
│   │   ├── 2019
│   │   │   └── IgnAe2019.ts
│   │   ├── 2020
│   │   │   └── IgnAe2020.ts
│   │   ├── 2021
│   │   │   └── IgnAe2021.ts
│   │   └── 2022
│   │       └── IgnAe2022.ts
│   └── common
│       └── IgnDataset.ts
```
## INSEE (Institut national de la statistique et des études économiques)
```
└── insee
```
Le jeu de données correspond au fichier (csv) décrivant les communes et arrondissements municipaux français.
Le dataset intégre le libellé des arrondissements de Paris, Lyon et Marseille (l_arr) dans la table `perimeters` sans tenir compte du millésime car le nom des arrondissements n'a pas changé depuis 2019.
```
    ├── communes
    │   ├── 2021
    │   │   └── InseeCom2021.ts
    │   └── 2022
    │       └── InseeCom2022.ts
```
Le jeu de données correspond au fichier (csv) décrivant les départements français.
Le dataset intégre le libellé des départements (l_dep) dans la table `perimeters` sans tenir compte du millésime car le nom des départements n'a pas changé depuis 2019.
```
    ├── departements
    │   ├── 2021
    │   │   └── InseeDep2021.ts
    │   └── 2022
    │       └── InseeDep2022.ts
```
Le jeu de données correspond au fichier (csv) décrivant les changements de codes INSEE communaux depuis 2019.
Le dataset intégre toutes les données de la table `com_evolution`
```
    ├── mvt_communaux
    │   ├── 2021
    │   │   └── InseeMvtcom2021.ts
    │   └── 2022
    │       └── InseeMvtcom2022.ts
```
Le jeu de données correspond au fichier (csv) décrivant les pays selon la nomenclature de l'INSEE.
Le dataset réalise une jointure avec la table temporaire créée par le dataset EurostatCountries2020 et intégre le code insee des pays (country), les noms des pays (l_country), les géométries (geom), les centroides (centroid),calcule les géométries simplifiés (geom_simple) et la surface des pays dans la table `perimeters`.
```
    ├── pays
    │   ├── 2021
    │   │   └── InseePays2021.ts
    │   └── 2022
    │       └── InseePays2022.ts
```
Le jeu de données correspond aux fichiers Excel décrivant les intercommunalités selon la nomenclature de l'INSEE.
Les datasets intégrent le libellé des communes (l_com), le code epci, le libellé des epci (l_epci), le code du département (dep) et le code région (reg) dans la table `perimeters`.
```
    ├── perimetres
    │   ├── 2019
    │   │   └── InseePerim2019.ts
    │   ├── 2020
    │   │   └── InseePerim2020.ts
    │   ├── 2021
    │   │   └── InseePerim2021.ts
    │   ├── 2022
    │   │   └── InseePerim2022.ts
    │   └── common
    │       └── InseePerimDataset.ts
```
Le jeu de données correspond au fichier (csv) décrivant les régions françaises.
Le dataset intégre le libellé des nouvelles régions (l_reg) dans la table `perimeters` sans tenir compte du millésime car le nom des régions n'a pas changé depuis 2019. (Il faudrait rajouter un dataset supplémentaire pour des millésimes avant 2016).
```
    └── regions
        ├── 2021
        │   └── InseeReg2021.ts
        └── 2022
            └── InseeReg2022.ts
```