# Évolutions-geo - Évolutions des mailles géographiques

## Objectifs

Ce projet sert à construire un référentiel géographique versionné par année (depuis 2019) qui est composé :
- des principales géographies administratives françaises (communes, arrondissements municipaux, epci, départements, régions, autorités organisatrices des mobilités).
- des géographies des pays du monde.
Le programme agrége des données issues de différents producteurs de données (INSEE, IGN, CEREMA, Commission européenne, Direction générale des collectivités locales) afin d'obtenir une base de données postgresql dont la structure est détaillée [ici](/docs/datastructure.md).

Il est actuellement utilisé par deux projets Beta.gouv :
- Le registre de preuve de covoiturage
- L'observatoire du covoiturage

## Installation
Deux possibilités pour installer le projet:
### Cloner le dépôt : 
```shell
  git clone git@github.com:betagouv/evolution_perimetres_geo.git
```

### Utiliser npm ou yarn pour installer le paquet comme dépendance de son projet:
```shell
  yarn add @betagouvpdc/evolution-geo
```

Attention, le programme nécessite :
- 7zip
- une base de données postgresql >= 12 avec postgis >= 3

Le projet inclut une façon simple de déployer un environnement local en utilisant Docker et Docker-compose.
Cet environnement est composé de deux services :
| Service  | Dockerfile                                | WorkDir | Description                                            |
|----------|-------------------------------------------|---------|--------------------------------------------------------|
| etl      | [Dockerfile](/docker/etl/Dockerfile)      | /etl    | Node 16 avec 7zip et Evolution-geo installés      |
| postgres | [Dockerfile](/docker/postgres/Dockerfile) |    -    | Base de donnée Postgresql 13 avec postgis 3.1 installé |

Pour déployer l'environnement, dans un terminal, se placer à la racine du projet et exécuter:
1. `cp etl/.env.example etl/.env`
2. Editer le fichier `etl/.env` suivant sa convenance.
3. `docker-compose up`
4. Dans un nouveau terminal, se connecter au service etl par la commande `docker exec -it evolution_perimetres_geo_etl_1  /bin/bash`
5. `npm run build`
6. Importer les données dans la BDD postgres avec les paramètres par défault
7. `npm start import`


## [Usage](/docs/usage.md)
## [Usage avancé](/docs/advanced.md)
## [Structure des tables obtenues](/docs/datastructure.md)
## [Détails des jeux de données sources](/docs/datasets.md)
