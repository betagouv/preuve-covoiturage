{{ config(
  materialized='incremental',
  unique_key=['_id'],
) }}

{% set tz = "'Europe/Paris'" %}
{% set geo_year = 2023 %} -- FIXME
{% set limit = 100000 %}

WITH trips AS (
  SELECT
    cc._id,
    oo._id as operator_id,

    cc.legacy_id,
    cs.acquisition_status,
    cs.fraud_status,
    cs.anomaly_status,

    -- time
    cc.start_datetime as start_at,
    cc.end_datetime as end_at,
    cc.end_datetime - cc.start_datetime as duration,

    -- distance
    cc.distance,
    ST_Y(cc.start_position::geometry) as start_lat,
    ST_X(cc.start_position::geometry) as start_lon,
    ST_Y(cc.end_position::geometry) as end_lat,
    ST_X(cc.end_position::geometry) as end_lon,

    -- administration
    cg.start_geo_code,
    cg.end_geo_code,

    -- operator data
    cc.operator_class,
    oo.name as operator,
    cc.operator_trip_id,
    cc.operator_journey_id,
    cc.passenger_operator_user_id as operator_passenger_id,
    cc.passenger_identity_key,
    cc.driver_operator_user_id as operator_driver_id,
    cc.driver_identity_key,

    -- money, money, money
    cc.passenger_contribution::float / 100 as passenger_contribution,
    cc.driver_revenue::float / 100 as driver_revenue,
    cc.passenger_seats,

    -- an array of json objects with the incentives
    -- to be split in numbered columns by the sql to csv exporter
    -- (limit to 4 records)
    jsonb_path_query_array(agg_incentives.incentive::jsonb, '$[0 to 3]') as incentive,

    -- same for RPC calculated incentives (limit to 4 records)
    jsonb_path_query_array(agg_incentives_rpc.incentive_rpc::jsonb, '$[0 to 3]') as incentive_rpc,

    -- CEE application data
    cee._id IS NOT NULL as cee_application

  FROM {{ source('carpool', 'carpools') }} cc

  -- join the carpool tables
  LEFT JOIN {{ source('carpool', 'status') }} cs ON cc._id = cs.carpool_id
  LEFT JOIN {{ source('carpool', 'geo') }} cg ON cc._id = cg.carpool_id

  -- get operator data
  LEFT JOIN {{ source('operator', 'operators') }} oo ON cc.operator_id = oo._id

  -- get CEE applications data
  LEFT JOIN {{ source('cee', 'cee_applications') }} cee ON cc._id = cee.carpool_id

  -- get incentive from {{ source('carpool', 'operator_incentives') }}
  LEFT JOIN LATERAL (
    SELECT json_agg(json_build_object(
      -- 'index', ci.idx,
      'siret', ci.siret,
      'name', ccp.legal_name,
      'amount', ci.amount::float / 100
    ) ORDER BY ci.idx) as incentive
    FROM {{ source('carpool', 'operator_incentives') }} ci
    LEFT JOIN {{ source('company', 'companies') }} ccp ON ci.siret = ccp.siret
    WHERE ci.carpool_id = cc._id
  ) as agg_incentives ON TRUE

  -- get RPC incentives from {{ source('policy', 'incentives') }}
  LEFT JOIN LATERAL (
    SELECT json_agg(json_build_object(
      'campaign_id', pp._id,
      'campaign_name', pp.name,
      'siret', ccp.siret,
      'name', ttg.name,
      'amount', pi_rpc.amount::float / 100
    )) as incentive_rpc
    FROM {{ source('policy', 'incentives') }} pi_rpc
    LEFT JOIN {{ source('policy', 'policies') }} pp ON pi_rpc.policy_id = pp._id
    LEFT JOIN {{ source('territory', 'territory_group') }} ttg ON pp.territory_id = ttg._id
    LEFT JOIN {{ source('company', 'companies') }} ccp ON ttg.company_id = ccp._id
    WHERE pi_rpc.operator_id = cc.operator_id
      AND pi_rpc.operator_journey_id = cc.operator_journey_id
  ) as agg_incentives_rpc ON TRUE

  {% if is_incremental() %}
  LEFT JOIN {{ this }} existing ON cc._id = existing._id
  {% endif %}

  WHERE true
    AND cs.acquisition_status = 'processed'
    
    {% if is_incremental() %}
      -- exclude already exported data
      AND existing._id IS NULL
    {% endif %}
  
  -- debug
  {% if limit > 0 %}
  LIMIT {{ limit }}
  {% endif %}
),

-- select latest geo data for start and end geo codes only
-- move country code and name in their own columns
geo AS (
  SELECT DISTINCT ON (arr)
    arr,
    CASE WHEN arr <> country THEN l_arr ELSE null END AS l_arr,
    com,
    l_com,
    epci,
    l_epci,
    dep,
    l_dep,
    reg,
    l_reg,
    country,
    CASE WHEN arr <> country THEN l_country ELSE l_arr END AS l_country,
    aom,
    l_aom,
    CASE
      WHEN surface > 0::double precision AND (pop::double precision / (surface::double precision / 100::double precision)) > 40::double precision THEN 3
      ELSE 2
    END as precision
  FROM {{ source('geo', 'perimeters') }}
  WHERE arr IN (SELECT UNNEST(ARRAY[start_geo_code, end_geo_code]) FROM trips)
  ORDER BY arr, year DESC
)

-- fields to export
SELECT
  -- internal identifiers to filter data
  trips._id as _id,
  trips.legacy_id as _legacy_id,
  trips.operator_id as _operator_id,
  trips.start_at as _start_at,
  
  gps.arr as _start_insee,
  gps.dep as _start_departement,
  gps.epci as _start_epci,
  gps.aom as _start_aom,
  gps.reg as _start_region,
  
  gpe.arr as _end_insee,
  gpe.dep as _end_departement,
  gpe.epci as _end_epci,
  gpe.aom as _end_aom,
  gpe.reg as _end_region,

  -- general trip identifiers
  trips.legacy_id as journey_id,
  trips.operator_trip_id,
  trips.operator_journey_id,
  trips.operator_class,
  trips.acquisition_status,
  trips.fraud_status,
  trips.anomaly_status,

  -- dates and times are in UTC
  -- ceil times to 10 minutes and format for user's convenience
  to_char(ts_ceil(trips.start_at at time zone {{ tz }}, 600), 'YYYY-MM-DD HH24:MI:SS') as start_datetime,
  to_char(ts_ceil(trips.start_at at time zone {{ tz }}, 600), 'YYYY-MM-DD') as start_date,
  to_char(ts_ceil(trips.start_at at time zone {{ tz }}, 600), 'HH24:MI:SS') as start_time,
  to_char(ts_ceil(trips.end_at at time zone {{ tz }}, 600), 'YYYY-MM-DD HH24:MI:SS') as end_datetime,
  to_char(ts_ceil(trips.end_at at time zone {{ tz }}, 600), 'YYYY-MM-DD') as end_date,
  to_char(ts_ceil(trips.end_at at time zone {{ tz }}, 600), 'HH24:MI:SS') as end_time,
  to_char(trips.duration, 'HH24:MI:SS') as duration,

  -- distance in km with meter precision (float)
  trips.distance::float / 1000 as distance,

  -- truncate position depending on population density
  trunc(trips.start_lat::numeric, gps.precision) as start_lat,
  trunc(trips.start_lon::numeric, gps.precision) as start_lon,
  trunc(trips.end_lat::numeric, gpe.precision) as end_lat,
  trunc(trips.end_lon::numeric, gpe.precision) as end_lon,

  -- administrative data
  gps.arr as start_insee,
  gps.l_arr as start_commune,
  gps.l_dep as start_departement,
  gps.l_epci as start_epci,
  gps.l_aom as start_aom,
  gps.l_reg as start_region,
  gps.l_country as start_pays,

  gpe.arr as end_insee,
  gpe.l_arr as end_commune,
  gpe.l_dep as end_departement,
  gpe.l_epci as end_epci,
  gpe.l_aom as end_aom,
  gpe.l_reg as end_region,
  gpe.l_country as end_pays,

  -- operator data
  trips.operator,
  trips.operator_passenger_id,
  trips.passenger_identity_key,
  trips.operator_driver_id,
  trips.driver_identity_key,

  -- financial data
  trips.driver_revenue,
  trips.passenger_contribution,
  trips.passenger_seats,

  -- CEE application data
  trips.cee_application,

  -- incentives
  trips.incentive[0]->>'siret' as incentive_0_siret,
  trips.incentive[0]->>'name' as incentive_0_name,
  trips.incentive[0]->>'amount' as incentive_0_amount,

  trips.incentive[1]->>'siret' as incentive_1_siret,
  trips.incentive[1]->>'name' as incentive_1_name,
  trips.incentive[1]->>'amount' as incentive_1_amount,

  trips.incentive[2]->>'siret' as incentive_2_siret,
  trips.incentive[2]->>'name' as incentive_2_name,
  trips.incentive[2]->>'amount' as incentive_2_amount,

  -- RPC incentives
  trips.incentive_rpc[0]->>'campaign_id' as incentive_rpc_0_campaign_id,
  trips.incentive_rpc[0]->>'campaign_name' as incentive_rpc_0_campaign_name,
  trips.incentive_rpc[0]->>'siret' as incentive_rpc_0_siret,
  trips.incentive_rpc[0]->>'name' as incentive_rpc_0_name,
  trips.incentive_rpc[0]->>'amount' as incentive_rpc_0_amount,

  trips.incentive_rpc[1]->>'campaign_id' as incentive_rpc_1_campaign_id,
  trips.incentive_rpc[1]->>'campaign_name' as incentive_rpc_1_campaign_name,
  trips.incentive_rpc[1]->>'siret' as incentive_rpc_1_siret,
  trips.incentive_rpc[1]->>'name' as incentive_rpc_1_name,
  trips.incentive_rpc[1]->>'amount' as incentive_rpc_1_amount,

  trips.incentive_rpc[2]->>'campaign_id' as incentive_rpc_2_campaign_id,
  trips.incentive_rpc[2]->>'campaign_name' as incentive_rpc_2_campaign_name,
  trips.incentive_rpc[2]->>'siret' as incentive_rpc_2_siret,
  trips.incentive_rpc[2]->>'name' as incentive_rpc_2_name,
  trips.incentive_rpc[2]->>'amount' as incentive_rpc_2_amount

FROM trips
LEFT JOIN geo AS gps ON trips.start_geo_code = gps.arr
LEFT JOIN geo AS gpe ON trips.end_geo_code = gpe.arr
