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

| \_id | uuid                                 | name       | legal_name | siret          | company | address | bank | contacts |
| ---: | ------------------------------------ | ---------- | ---------- | -------------- | ------- | ------- | ---- | -------- |
|    1 | dccac265-db95-4db3-96c5-40ed3755fd83 | MaxiCovoit | MaxiCovoit | 78017154200027 | ?       | ?       | ?    | ?        |
|    2 | 7bf928a2-e5f7-4a53-8174-71d26d387152 | MegaCovoit | MegaCovoit | 42169979400010 | ?       | ?       | ?    | ?        |

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

`common.insee`

Nantes : Atlantis
'44047','44150','44101','44094','44162','44215','44020','44143','44009','44198','44204','44024','44114','44190','44026','44194','44120','44166','44018','44109','44074','44171','44035','44172'

Annecy : Olympus
'74062','74148','74267','74061','74142','74275','74002','74108','74186','74233','74004','74111','74194','74242','74097','74176','74310','74019','74282','74213','74299','74010','74112','74198','74303','74067','74060','74254','74054','74138','74232','74036','74137','74219'

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

Identities

| \_id | uuid                                 | phone        | phone_trunc | operator_user_id | firstname | lastname | email               | travel_pass_name | travel_pass_user_id | over_18 |
| ---: | ------------------------------------ | ------------ | ----------- | ---------------- | --------- | -------- | ------------------- | ---------------- | ------------------- | ------- |
|    1 | 5bb842c0-1f88-475e-b7e2-202f837ddbd7 | +33612345670 |             |                  | Joana     |          | joana@example.com   |                  |                     | true    |
|    2 | ae6f1792-bb51-4673-b50f-f5ab00dde54a | +33612345671 |             |                  | Bob       |          | bob@example.com     |                  |                     | true    |
|    3 | 5afe864a-9b3f-4db1-8bb5-0d797f188173 | +33612345672 |             |                  | Marie     |          | marie@example.com   |                  |                     | true    |
|    4 | a7da590d-6274-4c54-8ff3-5782afbbd265 | +33612345673 |             |                  | Dylan     |          | dylan@example.com   |                  |                     | true    |
|    5 | acf1bffd-a8b3-4e38-a9fd-0389fcd0f2cd | +33612345674 |             |                  | Julie     |          | julie@example.com   |                  |                     | true    |
|    6 | 00a96371-4776-4ec7-abff-b5db044db48d | +33612345675 |             |                  | Richard   |          | richard@example.com |                  |                     |         |
|    7 | 1d645432-7c52-4583-84f3-4a8c6a9da88d |              | +336123456  | 1                |           |          |                     |                  |                     | true    |
|    8 | 05364dc2-e514-4671-b0d5-3051eefadca6 |              | +336123456  | 2                |           |          |                     |                  |                     | true    |
|    9 | 7d72bd7a-c236-4615-80b5-bf546622f860 |              | +336123456  | 3                |           |          |                     |                  |                     | true    |
|   10 | 7a305591-c555-4c67-91d4-dbc0a99522c5 |              | +336123456  | 4                |           |          |                     |                  |                     | true    |

### Policy

Avoir quelques templates / policies enregistrées

### Certificates
