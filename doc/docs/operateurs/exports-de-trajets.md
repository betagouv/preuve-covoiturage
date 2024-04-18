# Exports des trajets

- [Schema v3.0](#schema-d-export-des-trajets-v3-0)
- [Schema v2.0](#schema-d-export-des-trajets-v2-0)

## Schema d'export des trajets v3.0

Les trajets sont exportés au format CSV ou XLSX.

### Trajet

| Colonne             | Explications                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| trip_id             | Identifiant RPC permettant de regrouper des trajets (couples passager / conducteur) au sein d'un même voyage. |
| operator_journey_id | identifiant opérateur de regroupement du trajet                                                               |
| operator_class      | La classe de preuve correspondant au spécifications définies dans Classes de preuve de covoiturage.           |
| operator            | Nom de l'opérateur. vide si l'opérateur ne souhaite pas apparaitre.                                           |
| status              | statut du trajet pour le RPC : OK; anomaly_error; fraudcheck_error; expired; cancel                           |

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
| duration           | durée du trajet (HH:MM:SS)                                                             |

### Lieux

| Colonne           | Explications                                                                                                                            |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| distance          | distance covoiturée en kilomètres                                                                                                       |
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

| Colonne                | Explications                                                          |
| ---------------------- | --------------------------------------------------------------------- |
| driver_card            | Information a une carte de transport Oui/Non                          |
| passenger_card         | Information a une carte de transport Oui/Non                          |
| passenger_over_18      | Le passager est majeur (Oui) ou mineur (Non) ou non communiqué (vide) |
| passenger_seats        | Nombre de sièges réservés par l'occupant passager. Défaut : 1         |
|                        |                                                                       |
| operator_passenger_id  | identifiant opérateur du passager                                     |
| passenger_identity_key | identifiant unique inter-opérateur du passager                        |
| operator_driver_id     | identifiant opérateur du conducteur                                   |
| driver_identity_key    | identifiant unique inter-opérateur du conducteur                      |

### Subventions

| Colonne                         | Explications                                                                                                                                                                                                                                                 |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| cee_application                 | demande de CEE (Oui/Non)                                                                                                                                                                                                                                     |
| campaigns                       | List des `id` des campagnes d'incitation                                                                                                                                                                                                                     |
|                                 |                                                                                                                                                                                                                                                              |
| driver_revenue                  | La somme réellement perçue par le conducteur APRÈS que toutes les incitations (subventions employeurs, promotions opérateurs, incitations AOM, etc.), contributions des passagers aient été versées et que la commission de l’opérateur soit prise. En euros |
| passenger_contribution          | Coût réel total du service pour l’occupant passager en fonction du nombre de sièges réservés APRÈS que toutes les possibles incitations aient été versées (subventions employeurs, promotions opérateurs, incitations AOM, etc) En euros                     |
|                                 |                                                                                                                                                                                                                                                              |
| incentive_type                  | période "normale" ou "booster"                                                                                                                                                                                                                               |
| incentive\_{N}\_siret           | SIRET de la contrepartie financière N                                                                                                                                                                                                                        |
| incentive\_{N}\_amount          | montant en euros de la contrepartie financière N                                                                                                                                                                                                             |
| incentive_rpc\_{N}\_campaign_id | SIRET de la contrepartie financière N calculée par le RPC                                                                                                                                                                                                    |
| incentive_rpc\_{N}\_amount      | montant en euros de la contrepartie financière N calculée par le RPC                                                                                                                                                                                         |

## Schema d'export des trajets v2.0

Le schema v2.0 est déprécié. Il est recommandé d'utiliser le schema v3.0.

> TODO
