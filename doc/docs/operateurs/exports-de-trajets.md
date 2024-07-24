# Exports des trajets

- [Schema v3.0](#schema-d-export-des-trajets-v3-0)
- [Comparatif V2.0 / V3.0](#comparatif-v2-v3)

## Schema d'export des trajets v3.0

Les trajets sont exportés au format XLSX.

### Trajet

| Colonne             | Explications                                                                                                                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| journey_id          | Identifiant RPC d'un couple passager/conducteur                                                                                                                                                                                |
| operator_trip_id    | Identifiant opérateur permettant de regrouper plusieurs couples au sein d'un même trajet.                                                                                                                                      |
| operator_journey_id | Identifiant opérateur d'un couple passager/conducteur                                                                                                                                                                          |
| operator_class      | La classe de preuve correspondant aux spécifications définies dans [Classes de preuve de covoiturage](https://doc.covoiturage.beta.gouv.fr/le-registre-de-preuve-de-covoiturage/classes-de-preuve-and-identite/classes-a-b-c). |
| operator            | Nom de l'opérateur                                                                                                                                                                                                             |
| status              | Statut du trajet pour le RPC                                                                                                                                                                                                   |

### Temps

| Colonne            | Explications                                                                           |
| ------------------ | -------------------------------------------------------------------------------------- |
| start_datetime_utc | Date et heure du départ au format ISO 8601 (YYYY-MM-DDThh:mm:ssZ). Plage de 10 minutes |
| start_date_utc     | Date du départ au format ISO 8601 (YYYY-MM-DD).                                        |
| start_time_utc     | Heure du départ au format Thh:mm:ssZ). Plage de 10 minutes                             |
|                    |                                                                                        |
| end_datetime_utc   | Date et heure d'arrivée au format ISO 8601 (YYYY-MM-DDThh:mm:ssZ). Plage de 10 minutes |
| end_date_utc       | Date d'arrivée au format ISO 8601 (YYYY-MM-DD).                                        |
| end_time_utc       | Heure d'arrivée au format Thh:mm:ssZ). Plage de 10 minutes                             |
|                    |                                                                                        |
| duration           | Durée indicative du trajet (HH:MM:SS) calculée par le RPC                              |

### Lieux

| Colonne           | Explications                                                                                                                            |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| distance          | Distance covoiturée en kilomètres (précision au mètre).                                                                                 |
|                   |                                                                                                                                         |
| start_lat         | Latitude comprise entre 90deg et -90deg décimaux en datum WSG-84 Précision à 3 décimales zone dense et 2 décimales en zone peu dense.   |
| start_lon         | Longitude comprise entre 180deg et -90deg décimaux en datum WSG-84 Précision à 3 décimales zone dense et 2 décimales en zone peu dense. |
| end_lat           | Latitude comprise entre 90deg et -90deg décimaux en datum WSG-84 Précision à 3 décimales zone dense et 2 décimales en zone peu dense.   |
| end_lon           | Longitude comprise entre 180deg et -90deg décimaux en datum WSG-84 Précision à 3 décimales zone dense et 2 décimales en zone peu dense. |
|                   |                                                                                                                                         |
| start_insee       | Code INSEE commune ou arrondissement de la position de départ.                                                                          |
| start_commune     | Nom commune de départ.                                                                                                                  |
| start_departement | Nom du département de la position de départ.                                                                                            |
| start_epci        | EPCI de départ                                                                                                                          |
| start_aom         | AOM de départ                                                                                                                           |
| start_region      | Nom de la région de départ.                                                                                                             |
| start_pays        | Nom du pays de départ.                                                                                                                  |
| end_insee         | Code INSEE commune ou arrondissement de la position d'arrivée.                                                                          |
| end_commune       | Nom commune d'arrivée.                                                                                                                  |
| end_departement   | Nom du département de la position d'arrivée.                                                                                            |
| end_epci          | EPCI d'arrivée.                                                                                                                         |
| end_aom           | AOM d'arrivée                                                                                                                           |
| end_region        | Nom de la région d'arrivée.                                                                                                             |
| end_pays          | Nom du pays d'arrivée                                                                                                                   |

### Participants

| Colonne                | Explications                                                  |
| ---------------------- | ------------------------------------------------------------- |
| passenger_seats        | Nombre de sièges réservés par l'occupant passager. Défaut : 1 |
|                        |                                                               |
| operator_passenger_id  | identifiant opérateur du passager                             |
| passenger_identity_key | identifiant unique inter-opérateur du passager                |
| operator_driver_id     | identifiant opérateur du conducteur                           |
| driver_identity_key    | identifiant unique inter-opérateur du conducteur              |

### Subventions

| Colonne                           | Explications                                                                                                                                                                                                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| cee_application                   | Lien avec un dossier CEE (Oui/Non)                                                                                                                                                                                                                           |
|                                   |                                                                                                                                                                                                                                                              |
| driver_revenue                    | La somme réellement perçue par le conducteur APRÈS que toutes les incitations (subventions employeurs, promotions opérateurs, incitations AOM, etc.), contributions des passagers aient été versées et que la commission de l’opérateur soit prise. En euros |
| passenger_contribution            | Coût réel total du service pour l’occupant passager en fonction du nombre de sièges réservés APRÈS que toutes les possibles incitations aient été versées (subventions employeurs, promotions opérateurs, incitations AOM, etc) En euros                     |
|                                   |                                                                                                                                                                                                                                                              |
| incentive_type                    | Période "normale" ou "booster"                                                                                                                                                                                                                               |
| incentive\_{N}\_siret             | SIRET de la contrepartie financière N                                                                                                                                                                                                                        |
| incentive\_{N}\_name              | Organisme distributeur                                                                                                                                                                                                                                       |
| incentive\_{N}\_amount            | Montant en € de la contrepartie financière N                                                                                                                                                                                                                 |
| incentive_rpc\_{N}\_campaign_id   | ID de la campagne de la contrepartie financière N calculée par le RPC                                                                                                                                                                                        |
| incentive_rpc\_{N}\_campaign_name | Nom de la campagne de la contrepartie financière N calculée par le RPC                                                                                                                                                                                       |
| incentive_rpc\_{N}\_siret         | SIRET du sponsor de la contrepartie financière N calculée par le RPC                                                                                                                                                                                         |
| incentive_rpc\_{N}\_name          | Nom du sponsor de la contrepartie financière N calculée par le RPC                                                                                                                                                                                           |
| incentive_rpc\_{N}\_amount        | Montant en € de la contrepartie financière N calculée par le RPC                                                                                                                                                                                             |

## Comparatif V2.0 / V3.0

Tableau comparatif des colonnes entre les versions 2 et 3 de l'export des
trajets.

| V2.0                             | V3.0                          | Remarques sur la migration V2 -> V3                                            |
| -------------------------------- | ----------------------------- | ------------------------------------------------------------------------------ |
| journey_id                       | journey_id                    | Identifiant unique de couple passager/conducteur                               |
| trip_id                          |                               | Identifiant de regroupement des couples généré par le RPC                      |
|                                  | operator_trip_id              | Identifiant de regroupement des couples généré par l'opérateur                 |
|                                  | operator_journey_id           | Identifiant de couple généré par l'opérateur                                   |
| journey_start_datetime           | start_datetime_utc            | Passage en UTC                                                                 |
| journey_start_date               | start_date_utc                | Passage en UTC                                                                 |
| journey_start_time               | start_time_utc                | Passage en UTC                                                                 |
| journey_start_lon                | start_lon                     |                                                                                |
| journey_start_lat                | start_lat                     |                                                                                |
| journey_start_insee              | start_insee                   |                                                                                |
| journey_start_department         | start_departement             |                                                                                |
| journey_start_town               | start_commune                 |                                                                                |
| journey_start_towngroup          | start_epci                    |                                                                                |
| journey_start_country            | start_pays                    |                                                                                |
| journey_end_datetime             | end_datetime_utc              | Passage en UTC                                                                 |
| journey_end_date                 | end_date_utc                  | Passage en UTC                                                                 |
| journey_end_time                 | end_time_utc                  | Passage en UTC                                                                 |
| journey_end_lon                  | end_lon                       |                                                                                |
| journey_end_lat                  | end_lat                       |                                                                                |
| journey_end_insee                | end_insee                     |                                                                                |
| journey_end_department           | end_departement               |                                                                                |
| journey_end_town                 | end_commune                   |                                                                                |
| journey_end_towngroup            | end_epci                      |                                                                                |
| journey_end_country              | end_pays                      |                                                                                |
| driver_card                      |                               |                                                                                |
| passenger_card                   |                               |                                                                                |
| passenger_over_18                |                               |                                                                                |
| passenger_seats                  | passenger_seats               |                                                                                |
| operator_class                   | operator_class                |                                                                                |
| operator                         | operator                      |                                                                                |
| journey_distance_anounced        | distance                      | La distance envoyée par l'opérateur. Changement de format (m -> km)            |
| journey_distance_calculated      |                               |                                                                                |
| journey_duration_anounced        |                               |                                                                                |
| journey_duration_calculated      | duration                      | La durée indicative calculée par le RPC. Changement de format (MM -> HH:MM:SS) |
| operator_passenger_id            | operator_passenger_id         |                                                                                |
|                                  | passenger_identity_id         | Identifiant personnel inter-opérateurs                                         |
| operator_driver_id               | operator_driver_id            |                                                                                |
|                                  | driver_identity_key           | Identifiant personnel inter-opérateurs                                         |
| status                           | status                        | Détection des anomalies                                                        |
| passenger_id                     |                               |                                                                                |
| passenger_contribution           | passenger_contribution        |                                                                                |
| passenger_incentive_1_siret      |                               |                                                                                |
| passenger_incentive_1_amount     |                               |                                                                                |
| passenger_incentive_2_siret      |                               |                                                                                |
| passenger_incentive_2_amount     |                               |                                                                                |
| passenger_incentive_3_siret      |                               |                                                                                |
| passenger_incentive_3_amount     |                               |                                                                                |
| passenger_incentive_4_siret      |                               |                                                                                |
| passenger_incentive_4_amount     |                               |                                                                                |
| passenger_incentive_rpc_1_siret  |                               |                                                                                |
| passenger_incentive_rpc_1_name   |                               |                                                                                |
| passenger_incentive_rpc_1_amount |                               |                                                                                |
| passenger_incentive_rpc_2_siret  |                               |                                                                                |
| passenger_incentive_rpc_2_name   |                               |                                                                                |
| passenger_incentive_rpc_2_amount |                               |                                                                                |
| passenger_incentive_rpc_3_siret  |                               |                                                                                |
| passenger_incentive_rpc_3_name   |                               |                                                                                |
| passenger_incentive_rpc_3_amount |                               |                                                                                |
| passenger_incentive_rpc_4_siret  |                               |                                                                                |
| passenger_incentive_rpc_4_name   |                               |                                                                                |
| passenger_incentive_rpc_4_amount |                               |                                                                                |
| driver_id                        |                               |                                                                                |
| driver_revenue                   | driver_revenue                |                                                                                |
| driver_incentive_1_siret         |                               |                                                                                |
| driver_incentive_1_amount        |                               |                                                                                |
| driver_incentive_2_siret         |                               |                                                                                |
| driver_incentive_2_amount        |                               |                                                                                |
| driver_incentive_3_siret         |                               |                                                                                |
| driver_incentive_3_amount        |                               |                                                                                |
| driver_incentive_4_siret         |                               |                                                                                |
| driver_incentive_4_amount        |                               |                                                                                |
| driver_incentive_rpc_1_siret     |                               |                                                                                |
| driver_incentive_rpc_1_name      |                               |                                                                                |
| driver_incentive_rpc_1_amount    |                               |                                                                                |
| driver_incentive_rpc_2_siret     |                               |                                                                                |
| driver_incentive_rpc_2_name      |                               |                                                                                |
| driver_incentive_rpc_2_amount    |                               |                                                                                |
| driver_incentive_rpc_3_siret     |                               |                                                                                |
| driver_incentive_rpc_3_name      |                               |                                                                                |
| driver_incentive_rpc_3_amount    |                               |                                                                                |
| driver_incentive_rpc_4_siret     |                               |                                                                                |
| driver_incentive_rpc_4_name      |                               |                                                                                |
| driver_incentive_rpc_4_amount    |                               |                                                                                |
|                                  | cee_application               | Demande de dossier CEE (oui/non)                                               |
|                                  | incentive_type                | Type d'incitation (normale/booster)                                            |
|                                  | incentive_0_siret             | Incitation envoyée par l'opérateur : SIRET                                     |
|                                  | incentive_0_name              | Incitation envoyée par l'opérateur : nom                                       |
|                                  | incentive_0_amount            | Incitation envoyée par l'opérateur : montant en €                              |
|                                  | incentive_1_siret             | Incitation envoyée par l'opérateur : SIRET                                     |
|                                  | incentive_1_name              | Incitation envoyée par l'opérateur : nom                                       |
|                                  | incentive_1_amount            | Incitation envoyée par l'opérateur : montant en €                              |
|                                  | incentive_2_siret             | Incitation envoyée par l'opérateur : SIRET                                     |
|                                  | incentive_2_name              | Incitation envoyée par l'opérateur : nom                                       |
|                                  | incentive_2_amount            | Incitation envoyée par l'opérateur : montant en €                              |
|                                  | incentive_rpc_0_campaign_id   | Incitation calculée par le RPC : identifiant campagne                          |
|                                  | incentive_rpc_0_campaign_name | Incitation calculée par le RPC : nom de la campagne                            |
|                                  | incentive_rpc_0_siret         | Incitation calculée par le RPC : SIRET du sponsor                              |
|                                  | incentive_rpc_0_name          | Incitation calculée par le RPC : nom du sponsor                                |
|                                  | incentive_rpc_0_amount        | Incitation calculée par le RPC : montant en €                                  |
|                                  | incentive_rpc_1_campaign_id   | Incitation calculée par le RPC : identifiant campagne                          |
|                                  | incentive_rpc_1_campaign_name | Incitation calculée par le RPC : nom de la campagne                            |
|                                  | incentive_rpc_1_siret         | Incitation calculée par le RPC : SIRET du sponsor                              |
|                                  | incentive_rpc_1_name          | Incitation calculée par le RPC : nom du sponsor                                |
|                                  | incentive_rpc_1_amount        | Incitation calculée par le RPC : montant en €                                  |
|                                  | incentive_rpc_2_campaign_id   | Incitation calculée par le RPC : identifiant campagne                          |
|                                  | incentive_rpc_2_campaign_name | Incitation calculée par le RPC : nom de la campagne                            |
|                                  | incentive_rpc_2_siret         | Incitation calculée par le RPC : SIRET du sponsor                              |
|                                  | incentive_rpc_2_name          | Incitation calculée par le RPC : nom du sponsor                                |
|                                  | incentive_rpc_2_amount        | Incitation calculée par le RPC : montant en €                                  |
|                                  | offer_public                  | Offre du trajet publiée                                                        |
|                                  | offer_accepted_at             |                                                                                |
