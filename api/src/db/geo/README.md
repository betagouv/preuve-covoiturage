# Évolutions-geo - Évolutions des mailles géographiques

## Objectifs

Ce projet sert à construire un référentiel géographique versionné par année
(depuis 2019) qui est composé :

- des principales géographies administratives françaises (communes,
  arrondissements municipaux, epci, départements, régions, autorités
  organisatrices des mobilités).
- des géographies des pays du monde. Le programme agrége des données issues de
  différents producteurs de données (INSEE, IGN, CEREMA, Commission européenne,
  Direction générale des collectivités locales) afin d'obtenir une base de
  données SQL dont la structure est détaillée [dans `docs/datastructures.md`](/docs/datastructure.md).

## Dépendances

- 7zip (`p7zip`)
- une base de données postgresql >= 14 avec l'extension postgis >= 3

## Usage

```shell
just source
```

## [Usage avancé](/docs/advanced.md)

## [Structure des tables obtenues](/docs/datastructure.md)

## [Détails des jeux de données sources](/docs/datasets.md)
