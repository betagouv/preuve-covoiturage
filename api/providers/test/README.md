# Fixtures / demo

## Export the schemas and permissions after changes

```
pg_dump -d <database> -s > fixtures/schemas.sql
pg_dump -d <database> -t common.roles -a > fixtures/roles.sql
```

## Objectif

Développer une fixture de base de données qui soit utilisable pour chaque test de l'API.
Une fois en place, on peut imaginer un process de nettoyage de la base de données simplifié
pour facilement mettre en place un mode démo avec flash de la DB périodique.

## Notes

- :warning: les tests `ava` sont executés en parallèle
- faire un helper/macro/wrapper qui permette d'avoir un environnement propre pour chaque test (flash de la DB)
- commande dans `package.json` pour pouvoir flasher la base
- possibilité d'utiliser la base en cours ou en créer une nouvelle que l'on détruit à la fin
- tester les performances d'un flash avant chaque test
- mise à jour de la fixture quand des migrations sont appliquées ?

## Cas d'usage

#### Tests

Dans le cadre de tests automatisés, les tests ont besoin d'un environnement de DB propre et contrôlé. Chaque test
part du même environnement. Les tests sont executés en parallèle et leurs données sont nettoyées à la fin.

#### Mode demo

L'environnement est nettoyé toutes les 24h pour effacer les données de démo créées par les testeurs.

## Génération

Data
Refresh materialized views

2 approches possibles

1. prendre une DB actuelle et enlever des data
2. écrire des seeders qui remplissent la DB correctement

## Content

### Utilisateurs

`common.roles` (see set-permissions)

| slug            | description | permissions |
| --------------- | ----------- | ----------- |
| registry.admin  |             | ...         |
| registry.user   |             | ...         |
| operator.admin  |             | ...         |
| operator.user   |             | ...         |
| territory.admin |             | ...         |
| territory.user  |             | ...         |

`auth.users`

| \_id | role            | email                        | password  | territory_id | operator_id | status |
| ---: | --------------- | ---------------------------- | --------- | -----------: | ----------: | ------ |
|    1 | registry.admin  | reg.admin@example.com        | admin1234 |              |             | active |
|    2 | registry.user   | reg.user@example.com         | admin1234 |              |             | active |
|    3 | operator.admin  | maxicovoit.admin@example.com | admin1234 |              |           1 | active |
|    4 | operator.user   | maxicovoit.user@example.com  | admin1234 |              |           1 | active |
|    5 | operator.admin  | megacovoit.admin@example.com | admin1234 |              |           2 | active |
|    6 | operator.user   | megacovoit.user@example.com  | admin1234 |              |           2 | active |
|    7 | territory.admin | atlantis.admin@example.com   | admin1234 |            1 |             | active |
|    8 | territory.user  | atlantis.user@example.com    | admin1234 |            1 |             | active |
|    9 | territory.admin | olympus.admin@example.com    | admin1234 |            2 |             | active |
|   10 | territory.user  | olympus.user@example.com     | admin1234 |            2 |             | active |

### Companies

| siret          | siren     | nic   | legal_name | company_naf_code | establishment_naf_code | headquarter |
| -------------- | --------- | ----- | ---------- | ---------------- | ---------------------- | ----------- |
| 78017154200027 | 780171542 | 00027 | MaxiCovoit | 88.99B           | 88.99B                 | true        |
| 42169979400010 | 421699794 | 00010 | MegaCovoit | 94.99Z           | 94.99Z                 | true        |
| 40012127300025 | 400121273 | 00025 | Atlantis   | 88.99B           | 88.99B                 | true        |
| 34470365700017 | 344703657 | 00017 | Olympus    | 94.99Z           | 94.99Z                 | true        |

### Operators

`operator.operators`

| \_id | name       | legal_name | siret          | company | address | bank | contacts |
| ---: | ---------- | ---------- | -------------- | ------- | ------- | ---- | -------- |
|    1 | MaxiCovoit | MaxiCovoit | 78017154200027 | ?       | ?       | ?    | ?        |
|    2 | MegaCovoit | MegaCovoit | 42169979400010 | ?       | ?       | ?    | ?        |

`application.applications`

| \_id | uuid                                 | name             | owner_id | owner_service | permissions    |
| ---: | ------------------------------------ | ---------------- | -------: | ------------- | -------------- |
|    1 | 1efacd36-a85b-47b2-99df-cabbf74202b3 | Maxi Application |        1 | operator      | journey.create |
|    2 | 71c3c3d8-208f-455e-9c08-6ea2d48abf69 | Mega Application |        2 | operator      | journey.create |

### Territoires

`territory.territories`

| \_id | parent_id | name     | siret          | shortname | company | address | contacts |
| ---: | --------- | -------- | -------------- | --------- | ------- | ------- | -------- |
|    1 |           | Atlantis | 40012127300025 | Atl       | ?       | ?       | ?        |
|    2 |           | Olympus  | 34470365700017 | Olp       | ?       | ?       | ?        |

`common.insee` limited set

`territories.insee` pivot

### Acquisition

`acquisition.acquisitions`
`acquisition.errors` bonus

### Carpool

`carpool.carpools`
`carpool.identities`

Carpool

- plusieurs milliers de trajets répartis sur plusieurs mois pour avoir des stats cohérentes. (mode démo)
- quelques trajets pour avoir une base très légère à flasher très vite

### Policy

Avoir quelques templates / policies enregistrées

### Certificates
