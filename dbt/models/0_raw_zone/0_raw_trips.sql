{{ 
    config(
    materialized = 'table' if target.name == 'dev' else 'incremental',
    incremental_strategy = 'delete+insert',
    unique_key=[ 'operator_journey_id', '_id'],
    indexes = [
      {
        'columns':[
          'start_datetime'
        ],
      },
      {
        'columns':[
          'operator_journey_id'
        ],
      }
    ]
  )
}}

SELECT
  cc.*,
  -- Timezone-aware start_datetime
  oo.name
    AS operator_name,

  -- Timezone-aware end_datetime
  oo.siret
    AS operator_siret,
  cs._id
    AS status_id,
  cs.updated_at
    AS status_updated_at,
  cs.acquisition_status,
  cs.fraud_status,
  cs.anomaly_status,
  cg._id
    AS geo_id,
  cg.start_geo_code,
  -- Carpool final status
  cg.end_geo_code,
  -- Carpool valid status
  cg.updated_at
    AS geo_updated_at,
  cg.errors
    AS geo_errors,
  CASE
    WHEN
      cg.start_geo_code::text ~ '^97[1-2]'
      THEN cc.start_datetime AT TIME ZONE 'America/Guadeloupe'
    WHEN
      cg.start_geo_code::text ~ '^973'
      THEN cc.start_datetime AT TIME ZONE 'America/Cayenne'
    WHEN
      cg.start_geo_code::text ~ '^974'
      THEN cc.start_datetime AT TIME ZONE 'Indian/Reunion'
    WHEN
      cg.start_geo_code::text ~ '^976'
      THEN cc.start_datetime AT TIME ZONE 'Indian/Mayotte'
    ELSE cc.start_datetime AT TIME ZONE 'Europe/Paris'
  END
    AS tz_start_datetime,
  CASE
    WHEN
      cg.end_geo_code::text ~ '^97[1-2]'
      THEN cc.end_datetime AT TIME ZONE 'America/Guadeloupe'
    WHEN
      cg.end_geo_code::text ~ '^973'
      THEN cc.end_datetime AT TIME ZONE 'America/Cayenne'
    WHEN
      cg.end_geo_code::text ~ '^974'
      THEN cc.end_datetime AT TIME ZONE 'Indian/Reunion'
    WHEN
      cg.end_geo_code::text ~ '^976'
      THEN cc.end_datetime AT TIME ZONE 'Indian/Mayotte'
    ELSE cc.end_datetime AT TIME ZONE 'Europe/Paris'
  END
    AS tz_end_datetime,
  coalesce(
    cs.acquisition_status IN (
      'processed', 'failed', 'canceled', 'expired', 'terms_violation_error'
    ),
    FALSE
  )             AS final_status,
  coalesce(
    cs.acquisition_status = 'processed'
    AND cs.anomaly_status = 'passed'
    AND cs.fraud_status = 'passed',
    FALSE)
    AS valid_status

FROM {{ source('carpool', 'carpools') }} AS cc
LEFT JOIN {{ source('carpool', 'status') }} AS cs ON cc._id = cs.carpool_id
LEFT JOIN {{ source('carpool', 'geo') }} AS cg ON cc._id = cg.carpool_id
LEFT JOIN
  {{ source('operator', 'operators') }} AS oo
  ON cc.operator_id = oo._id
WHERE date_part('year', cc.start_datetime) >= 2020
{% if is_incremental() %}
  AND cc.start_datetime::date >= (
        SELECT COALESCE(MAX(start_datetime), DATE '1970-01-01')
        FROM {{ this }}
  )::date
{% endif %}

{% if target.name == 'dev' %}
  LIMIT 5000
{% endif %}
