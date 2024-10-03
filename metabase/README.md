# Metabase

```sql
\dv stats.*
```

```sql
\copy (
 select 'daily_acquisition_status' as query, id, name from report_card where dataset_query like '%daily_acquisition_status%' union
 select 'daily_acquisition_to_carpool' as query, id, name from report_card where dataset_query like '%daily_acquisition_to_carpool%' union
 select 'daily_applicants_trips' as query, id, name from report_card where dataset_query like '%daily_applicants_trips%' union
 select 'dgec_distances_range' as query, id, name from report_card where dataset_query like '%dgec_distances_range%' union
 select 'dgec_driver_means_and_medians' as query, id, name from report_card where dataset_query like '%dgec_driver_means_and_medians%' union
 select 'dgec_km_means_and_medians' as query, id, name from report_card where dataset_query like '%dgec_km_means_and_medians%' union
 select 'dgec_occupation_rate' as query, id, name from report_card where dataset_query like '%dgec_occupation_rate%' union
 select 'dgec_trips' as query, id, name from report_card where dataset_query like '%dgec_trips%' union
 select 'fraud_multi_oui' as query, id, name from report_card where dataset_query like '%fraud_multi_oui%' union
 select 'fraud_multi_oui_on_idfm_sum_by_oui' as query, id, name from report_card where dataset_query like '%fraud_multi_oui_on_idfm_sum_by_oui%' union
 select 'fraud_multi_oui_on_idfm_with_oji' as query, id, name from report_card where dataset_query like '%fraud_multi_oui_on_idfm_with_oji%' union
 select 'fraudckeck' as query, id, name from report_card where dataset_query like '%fraudckeck%' union
 select 'hebdo' as query, id, name from report_card where dataset_query like '%hebdo%' union
 select 'highest_triangular_od_level_1' as query, id, name from report_card where dataset_query like '%highest_triangular_od_level_1%' union
 select 'monthly_fraud_multi_oui_by_operator' as query, id, name from report_card where dataset_query like '%monthly_fraud_multi_oui_by_operator%' union
 select 'monthly_phone_trunc_change_by_operator' as query, id, name from report_card where dataset_query like '%monthly_phone_trunc_change_by_operator%' union
 select 'montly_fraud_interoperators' as query, id, name from report_card where dataset_query like '%montly_fraud_interoperators%' union
 select 'montly_fraud_interoperators_v2' as query, id, name from report_card where dataset_query like '%montly_fraud_interoperators_v2%' union
 select 'montly_phone_trunc_change_by_operator_on_idkey' as query, id, name from report_card where dataset_query like '%montly_phone_trunc_change_by_operator_on_idkey%' union
 select 'operators_first_trip' as query, id, name from report_card where dataset_query like '%operators_first_trip%' union
 select 'peak_hours' as query, id, name from report_card where dataset_query like '%peak_hours%' union
 select 'peak_hours_avg' as query, id, name from report_card where dataset_query like '%peak_hours_avg%' union
 select 'peak_hours_split' as query, id, name from report_card where dataset_query like '%peak_hours_split%' union
 select 'primo_drivers' as query, id, name from report_card where dataset_query like '%primo_drivers%' union
 select 'primo_per_month' as query, id, name from report_card where dataset_query like '%primo_per_month%' union
 select 'public_aom_with_campaign' as query, id, name from report_card where dataset_query like '%public_aom_with_campaign%' union
 select 'public_stats' as query, id, name from report_card where dataset_query like '%public_stats%' union
 select 'public_stats_primos' as query, id, name from report_card where dataset_query like '%public_stats_primos%' union
 select 'public_stats_trip_by_months' as query, id, name from report_card where dataset_query like '%public_stats_trip_by_months%' union
 select 'trips_by_distance' as query, id, name from report_card where dataset_query like '%trips_by_distance%' union
 select 'trips_per_id_per_month' as query, id, name from report_card where dataset_query like '%trips_per_id_per_month%' union
 select 'trips_per_operator' as query, id, name from report_card where dataset_query like '%trips_per_operator%' union
 select 'weekly_active_campaigns' as query, id, name from report_card where dataset_query like '%weekly_active_campaigns%' union
 select 'weekly_cee_per_week_long' as query, id, name from report_card where dataset_query like '%weekly_cee_per_week_long%' union
 select 'weekly_cee_per_week_short' as query, id, name from report_card where dataset_query like '%weekly_cee_per_week_short%' union
 select 'weekly_fraud_car_filling_rate' as query, id, name from report_card where dataset_query like '%weekly_fraud_car_filling_rate%' union
 select 'weekly_fraud_day_night_rate' as query, id, name from report_card where dataset_query like '%weekly_fraud_day_night_rate%'
 order by 1
) to '/tmp/metabase.csv'
```
