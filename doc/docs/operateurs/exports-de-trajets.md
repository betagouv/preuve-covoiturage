# Exports des trajets

- [Schema v3.0](#schema-d-export-des-trajets-v3-0)
- [Comparatif V2.0 / V3.0](#comparatif-v2-0-v3-0)

## Schema d'export des trajets v3.0

Les trajets sont exportés au format XLSX (CSV à venir).

Le 🔒 indique que ces données ne sont pas présentes dans l'export Open data.

### Trajet

| Colonne                     | Explications                                                                                                                                                                                                                  |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| journey_id                  | Identifiant RPC d'un couple passager/conducteur                                                                                                                                                                               |
| operator_trip_id&nbsp;🔒    | Identifiant opérateur permettant de regrouper plusieurs couples au sein d'un même trajet                                                                                                                                      |
| operator_journey_id&nbsp;🔒 | Identifiant opérateur d'un couple passager/conducteur                                                                                                                                                                         |
| operator_class              | La classe de preuve correspondant aux spécifications définies dans [Classes de preuve de covoiturage](https://doc.covoiturage.beta.gouv.fr/le-registre-de-preuve-de-covoiturage/classes-de-preuve-and-identite/classes-a-b-c) |
| operator&nbsp;🔒            | Nom de l'opérateur                                                                                                                                                                                                            |
| status                      | Statut du trajet pour le RPC                                                                                                                                                                                                  |

### Dates et heures

| Colonne        | Explications                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------- |
| start_datetime | Date et heure locale du départ au format ISO 8601 (YYYY-MM-DDThh:mm:ss). Plage de 10 minutes |
| start_date     | Date locale du départ au format ISO 8601 (YYYY-MM-DD)                                        |
| start_time     | Heure locale du départ au format Thh:mm:ss). Plage de 10 minutes                             |
|                |                                                                                              |
| end_datetime   | Date et heure locale d'arrivée au format ISO 8601 (YYYY-MM-DDThh:mm:ss). Plage de 10 minutes |
| end_date       | Date locale d'arrivée au format ISO 8601 (YYYY-MM-DD)                                        |
| end_time       | Heure locale d'arrivée au format Thh:mm:ss). Plage de 10 minutes                             |
|                |                                                                                              |
| duration       | Durée indicative du trajet (HH:MM:SS) calculée par le RPC                                    |

> Les dates et heures sont exprimées dans le fuseau horaire `Europe/Paris`.

### Lieux

| Colonne           | Explications                                                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| distance          | Distance covoiturée en kilomètres (précision au mètre)                                                                                 |
|                   |                                                                                                                                        |
| start_lat         | Latitude comprise entre 90deg et -90deg décimaux en datum WSG-84 Précision à 3 décimales zone dense et 2 décimales en zone peu dense   |
| start_lon         | Longitude comprise entre 180deg et -90deg décimaux en datum WSG-84 Précision à 3 décimales zone dense et 2 décimales en zone peu dense |
| end_lat           | Latitude comprise entre 90deg et -90deg décimaux en datum WSG-84 Précision à 3 décimales zone dense et 2 décimales en zone peu dense   |
| end_lon           | Longitude comprise entre 180deg et -90deg décimaux en datum WSG-84 Précision à 3 décimales zone dense et 2 décimales en zone peu dense |
|                   |                                                                                                                                        |
| start_insee       | Code INSEE commune ou arrondissement de la position de départ                                                                          |
| start_commune     | Nom commune de départ                                                                                                                  |
| start_departement | Nom du département de la position de départ                                                                                            |
| start_epci        | EPCI de départ                                                                                                                         |
| start_aom         | AOM de départ                                                                                                                          |
| start_region      | Nom de la région de départ                                                                                                             |
| start_pays        | Nom du pays de départ                                                                                                                  |
| end_insee         | Code INSEE commune ou arrondissement de la position d'arrivée                                                                          |
| end_commune       | Nom commune d'arrivée                                                                                                                  |
| end_departement   | Nom du département de la position d'arrivée                                                                                            |
| end_epci          | EPCI d'arrivée                                                                                                                         |
| end_aom           | AOM d'arrivée                                                                                                                          |
| end_region        | Nom de la région d'arrivée                                                                                                             |
| end_pays          | Nom du pays d'arrivée                                                                                                                  |

### Participants

| Colonne                        | Explications                                                  |
| ------------------------------ | ------------------------------------------------------------- |
| passenger_seats                | Nombre de sièges réservés par l'occupant passager. Défaut : 1 |
|                                |                                                               |
| operator_passenger_id&nbsp;🔒  | identifiant opérateur du passager                             |
| passenger_identity_key&nbsp;🔒 | identifiant unique inter-opérateur du passager                |
| operator_driver_id&nbsp;🔒     | identifiant opérateur du conducteur                           |
| driver_identity_key&nbsp;🔒    | identifiant unique inter-opérateur du conducteur              |

### Subventions

| Colonne                           | Explications                                                                                                                                                                                                                                          |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cee_application                   | Lien avec un dossier CEE (Oui/Non)                                                                                                                                                                                                                    |
|                                   |                                                                                                                                                                                                                                                       |
| driver_revenue&nbsp;🔒            | La somme en € réellement perçue par le conducteur APRÈS que toutes les incitations (subventions employeurs, promotions opérateurs, incitations AOM, etc.), contributions des passagers ont été versées et que la commission de l’opérateur soit prise |
| passenger_contribution&nbsp;🔒    | Coût réel total en € du service pour l’occupant passager en fonction du nombre de sièges réservés APRÈS que toutes les possibles incitations ont été versées (subventions employeurs, promotions opérateurs, incitations AOM, etc)                    |
| incentive_type                    | Période "normale" ou "booster"                                                                                                                                                                                                                        |
| incentive\_{N}\_siret             | SIRET de la contrepartie financière N                                                                                                                                                                                                                 |
| incentive\_{N}\_name              | Organisme distributeur                                                                                                                                                                                                                                |
| incentive\_{N}\_amount            | Montant en € de la contrepartie financière N                                                                                                                                                                                                          |
| incentive_rpc\_{N}\_campaign_id   | ID de la campagne de la contrepartie financière N calculée par le RPC                                                                                                                                                                                 |
| incentive_rpc\_{N}\_campaign_name | Nom de la campagne de la contrepartie financière N calculée par le RPC                                                                                                                                                                                |
| incentive_rpc\_{N}\_siret         | SIRET du sponsor de la contrepartie financière N calculée par le RPC                                                                                                                                                                                  |
| incentive_rpc\_{N}\_name          | Nom du sponsor de la contrepartie financière N calculée par le RPC                                                                                                                                                                                    |
| incentive_rpc\_{N}\_amount        | Montant en € de la contrepartie financière N calculée par le RPC                                                                                                                                                                                      |

## Comparatif V2.0 / V3.0

Tableau comparatif des colonnes entre les versions 2 et 3 de l'export des
trajets.

| V2.0                             | V3.0                          | Remarques sur la migration V2 -> V3                                            |
| -------------------------------- | ----------------------------- | ------------------------------------------------------------------------------ |
| journey_id                       | journey_id                    | Identifiant unique de couple passager/conducteur                               |
| trip_id                          |                               | Identifiant de regroupement des couples généré par le RPC                      |
|                                  | operator_trip_id              | Identifiant de regroupement des couples généré par l'opérateur                 |
|                                  | operator_journey_id           | Identifiant de couple généré par l'opérateur                                   |
| journey_start_datetime           | start_datetime                | Passage en UTC                                                                 |
| journey_start_date               | start_date                    | Passage en UTC                                                                 |
| journey_start_time               | start_time                    | Passage en UTC                                                                 |
| journey_start_lon                | start_lon                     |                                                                                |
| journey_start_lat                | start_lat                     |                                                                                |
| journey_start_insee              | start_insee                   |                                                                                |
| journey_start_department         | start_departement             |                                                                                |
| journey_start_town               | start_commune                 |                                                                                |
| journey_start_towngroup          | start_epci                    |                                                                                |
| journey_start_country            | start_pays                    |                                                                                |
| journey_end_datetime             | end_datetime                  | Passage en UTC                                                                 |
| journey_end_date                 | end_date                      | Passage en UTC                                                                 |
| journey_end_time                 | end_time                      | Passage en UTC                                                                 |
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
| status                           | status                        | Statut du trajet : `acquisition_error`, `validation_error`, `normalization_error`, `fraud_error`, `anomaly_error`, `ok`, `expired`, `canceled`, `pending`, `unknown`                                                        |
| passenger_id                     |                               |                                                                                |
| passenger_contribution           | passenger_contribution        |                                                                                |
| passenger_incentive_N_siret      |                               |                                                                                |
| passenger_incentive_N_amount     |                               |                                                                                |
| passenger_incentive_rpc_N_siret  |                               |                                                                                |
| passenger_incentive_rpc_N_name   |                               |                                                                                |
| passenger_incentive_rpc_N_amount |                               |                                                                                |
| driver_id                        |                               |                                                                                |
| driver_revenue                   | driver_revenue                |                                                                                |
| driver_incentive_N_siret         |                               |                                                                                |
| driver_incentive_N_amount        |                               |                                                                                |
| driver_incentive_rpc_N_siret     |                               |                                                                                |
| driver_incentive_rpc_N_name      |                               |                                                                                |
| driver_incentive_rpc_N_amount    |                               |                                                                                |
|                                  | cee_application               | Demande de dossier CEE (oui/non)                                               |
|                                  | incentive_type                | Type d'incitation (normale/booster)                                            |
|                                  | incentive_N_siret             | Incitation envoyée par l'opérateur : SIRET                                     |
|                                  | incentive_N_name              | Incitation envoyée par l'opérateur : nom                                       |
|                                  | incentive_N_amount            | Incitation envoyée par l'opérateur : montant en €                              |
|                                  | incentive_rpc_N_campaign_id   | Incitation calculée par le RPC : identifiant campagne                          |
|                                  | incentive_rpc_N_campaign_name | Incitation calculée par le RPC : nom de la campagne                            |
|                                  | incentive_rpc_N_siret         | Incitation calculée par le RPC : SIRET du sponsor                              |
|                                  | incentive_rpc_N_name          | Incitation calculée par le RPC : nom du sponsor                                |
|                                  | incentive_rpc_N_amount        | Incitation calculée par le RPC : montant en €                                  |
