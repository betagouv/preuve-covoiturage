{{
  config(
    tags = ['export', 'cache'],
    materialized='incremental',
    unique_key=['_id'],
    on_schema_change='fail',
    pre_hook = [
      """
        CREATE TEMPORARY TABLE IF NOT EXISTS tmp_ordered_cc_id AS
          SELECT _id, start_datetime
          FROM {{ source('carpool', 'carpools') }}
          WHERE start_datetime < now()
          ORDER BY start_datetime ASC
      """,
    ],
    post_hook = [
      """
        CREATE INDEX IF NOT EXISTS idx_cluster_start_at ON {{ this }} (_start_at)
      """,
      """
        CLUSTER {{ this }} USING idx_cluster_start_at
      """,
    ],
  )
}}

{% set tz = "'Europe/Paris'" %}
{% set limit = 0 %}

WITH

missing AS (
  SELECT tmp_ordered_cc_id._id
  FROM tmp_ordered_cc_id

  {% if is_incremental() %}
  WHERE tmp_ordered_cc_id.start_datetime > (SELECT MAX(_start_at) FROM {{ this }})
  {% endif %}

  ORDER BY tmp_ordered_cc_id.start_datetime ASC

  {% if limit > 0 %}
  LIMIT {{ limit }}
  {% endif %}
),

trips AS (
  SELECT
    cc._id,
    oo._id                        AS operator_id,

    cc.legacy_id,
    cs.acquisition_status,
    cs.fraud_status,
    cs.anomaly_status,

    -- time
    cc.start_datetime             AS start_at,
    cc.end_datetime               AS end_at,
    cc.distance,

    -- distance
    cg.start_geo_code,
    cg.end_geo_code,
    cc.operator_class,
    oo.name                       AS operator,
    cc.operator_trip_id,

    -- administration
    cc.operator_journey_id,
    cc.passenger_operator_user_id AS operator_passenger_id,

    -- operator data
    cc.passenger_identity_key,
    cc.driver_operator_user_id    AS operator_driver_id,
    cc.driver_identity_key,
    cc.passenger_seats,
    cc.end_datetime
    - cc.start_datetime           AS duration,
    ST_Y(
      cc.start_position::geometry
    )                             AS start_lat,
    ST_X(
      cc.start_position::geometry
    )                             AS start_lon,
    ST_Y(
      cc.end_position::geometry
    )                             AS end_lat,

    -- money, money, money
    ST_X(
      cc.end_position::geometry
    )                             AS end_lon,
    cc.passenger_contribution::float
    / 100                         AS passenger_contribution,
    cc.driver_revenue::float
    / 100                         AS driver_revenue,

    -- an array of json objects with the incentives
    -- to be split in numbered columns by the sql to csv exporter
    -- (limit to 4 records)
    JSONB_PATH_QUERY_ARRAY(
      agg_incentives.incentive::jsonb, '$[0 to 3]'
    )                             AS incentive,

    -- same for RPC calculated incentives (limit to 4 records)
    JSONB_PATH_QUERY_ARRAY(
      agg_incentives_rpc.incentive_rpc::jsonb, '$[0 to 3]'
    )                             AS incentive_rpc,

    -- CEE application data
    cee._id IS NOT NULL           AS cee_application

  -- use the ordered list of carpool ids as a base
  -- to order the carpools
  FROM missing
  LEFT JOIN {{ source('carpool', 'carpools') }} AS cc ON missing._id = cc._id

  -- join the carpool tables
  LEFT JOIN {{ source('carpool', 'status') }} AS cs ON cc._id = cs.carpool_id
  LEFT JOIN {{ source('carpool', 'geo') }} AS cg ON cc._id = cg.carpool_id

  -- get operator data
  LEFT JOIN
    {{ source('operator', 'operators') }} AS oo
    ON cc.operator_id = oo._id

  -- get CEE applications data
  LEFT JOIN
    {{ source('cee', 'cee_applications') }} AS cee
    ON cc._id = cee.carpool_id

  -- get incentive from {{ source('carpool', 'operator_incentives') }}
  LEFT JOIN LATERAL (
    SELECT
      JSON_AGG(JSON_BUILD_OBJECT(
        -- 'index', ci.idx,
        'siret', ci.siret,
        'name', ccp.legal_name,
        'amount', ci.amount::float / 100
      )
      ORDER BY ci.idx) AS incentive
    FROM {{ source('carpool', 'operator_incentives') }} AS ci
    LEFT JOIN
      {{ source('company', 'companies') }} AS ccp
      ON ci.siret = ccp.siret
    WHERE ci.carpool_id = cc._id
  ) AS agg_incentives ON TRUE

  -- get RPC incentives from {{ source('policy', 'incentives') }}
  LEFT JOIN LATERAL (
    SELECT
      JSON_AGG(JSON_BUILD_OBJECT(
        'campaign_id', pp._id,
        'campaign_name', pp.name,
        'siret', ccp.siret,
        'name', ttg.name,
        'amount', pi_rpc.amount::float / 100
      )) AS incentive_rpc
    FROM {{ source('policy', 'incentives') }} AS pi_rpc
    LEFT JOIN
      {{ source('policy', 'policies') }} AS pp
      ON pi_rpc.policy_id = pp._id
    LEFT JOIN
      {{ source('territory', 'territory_group') }} AS ttg
      ON pp.territory_id = ttg._id
    LEFT JOIN
      {{ source('company', 'companies') }} AS ccp
      ON ccp._id = ttg.company_id
    WHERE
      pi_rpc.operator_id = cc.operator_id
      AND pi_rpc.operator_journey_id = cc.operator_journey_id
  ) AS agg_incentives_rpc ON TRUE

  WHERE cs.acquisition_status = 'processed'
    AND cs.fraud_status <> 'pending'
    AND cs.anomaly_status <> 'pending'
),

-- select latest geo data for start and end geo codes only
-- move country code and name in their own columns
geo AS (
  SELECT DISTINCT ON (arr)
    arr,
    com,
    l_com,
    epci,
    l_epci,
    dep,
    l_dep,
    reg,
    l_reg,
    country,
    aom,
    l_aom,
    CASE WHEN arr <> country THEN l_arr END                AS l_arr,
    CASE WHEN arr <> country THEN l_country ELSE l_arr END AS l_country,
    CASE
      WHEN
        surface > 0::double precision
        AND (
          pop::double precision
          / (surface::double precision / 100::double precision)
        )
        > 40::double precision
        THEN 3
      ELSE 2
    END                                                    AS precision
  FROM {{ source('geo', 'perimeters') }}
  WHERE arr IN (SELECT UNNEST(ARRAY[start_geo_code, end_geo_code]) FROM trips)
  ORDER BY arr ASC, year DESC
)

-- fields to export
SELECT
  -- internal identifiers to filter data
  trips._id,
  trips.legacy_id     AS _legacy_id,
  trips.operator_id   AS _operator_id,
  trips.start_at      AS _start_at,

  gps.arr             AS _start_insee,
  gps.dep             AS _start_departement,
  gps.epci            AS _start_epci,
  gps.aom             AS _start_aom,
  gps.reg             AS _start_region,

  gpe.arr             AS _end_insee,
  gpe.dep             AS _end_departement,
  gpe.epci            AS _end_epci,
  gpe.aom             AS _end_aom,
  gpe.reg             AS _end_region,

  -- general trip identifiers
  trips.legacy_id     AS journey_id,
  trips.operator_trip_id,
  trips.operator_journey_id,
  trips.operator_class,
  trips.acquisition_status,
  trips.fraud_status,
  trips.anomaly_status,

  -- dates and times are in UTC
  -- ceil times to 10 minutes and format for user's convenience
  TO_CHAR(
    TS_CEIL(trips.start_at AT TIME ZONE {{ tz }}, 600), 'YYYY-MM-DD HH24:MI:SS'
  )                   AS start_datetime,
  TO_CHAR(
    TS_CEIL(trips.start_at AT TIME ZONE {{ tz }}, 600), 'YYYY-MM-DD'
  )                   AS start_date,
  TO_CHAR(
    TS_CEIL(trips.start_at AT TIME ZONE {{ tz }}, 600), 'HH24:MI:SS'
  )                   AS start_time,
  TO_CHAR(
    TS_CEIL(trips.end_at AT TIME ZONE {{ tz }}, 600), 'YYYY-MM-DD HH24:MI:SS'
  )                   AS end_datetime,
  TO_CHAR(
    TS_CEIL(trips.end_at AT TIME ZONE {{ tz }}, 600), 'YYYY-MM-DD'
  )                   AS end_date,
  TO_CHAR(
    TS_CEIL(trips.end_at AT TIME ZONE {{ tz }}, 600), 'HH24:MI:SS'
  )                   AS end_time,
  TO_CHAR(
    trips.duration, 'HH24:MI:SS'
  )                   AS duration,

  -- distance in km with meter precision (float)
  trips.distance::float
  / 1000              AS distance,

  -- truncate position depending on population density
  TRUNC(
    trips.start_lat::numeric, gps.precision
  )                   AS start_lat,
  TRUNC(
    trips.start_lon::numeric, gps.precision
  )                   AS start_lon,
  TRUNC(
    trips.end_lat::numeric, gpe.precision
  )                   AS end_lat,
  TRUNC(
    trips.end_lon::numeric, gpe.precision
  )                   AS end_lon,

  -- administrative data
  gps.arr             AS start_insee,
  gps.l_arr           AS start_commune,
  gps.l_dep           AS start_departement,
  gps.l_epci          AS start_epci,
  gps.l_aom           AS start_aom,
  gps.l_reg           AS start_region,
  gps.l_country       AS start_pays,

  gpe.arr             AS end_insee,
  gpe.l_arr           AS end_commune,
  gpe.l_dep           AS end_departement,
  gpe.l_epci          AS end_epci,
  gpe.l_aom           AS end_aom,
  gpe.l_reg           AS end_region,
  gpe.l_country       AS end_pays,

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
  trips.incentive[0]
  ->> 'siret'         AS incentive_0_siret,
  trips.incentive[0]
  ->> 'name'          AS incentive_0_name,
  trips.incentive[0]
  ->> 'amount'        AS incentive_0_amount,

  trips.incentive[1]
  ->> 'siret'         AS incentive_1_siret,
  trips.incentive[1]
  ->> 'name'          AS incentive_1_name,
  trips.incentive[1]
  ->> 'amount'        AS incentive_1_amount,

  trips.incentive[2]
  ->> 'siret'         AS incentive_2_siret,
  trips.incentive[2]
  ->> 'name'          AS incentive_2_name,
  trips.incentive[2]
  ->> 'amount'        AS incentive_2_amount,

  -- RPC incentives
  trips.incentive_rpc[0]
  ->> 'campaign_id'   AS incentive_rpc_0_campaign_id,
  trips.incentive_rpc[0]
  ->> 'campaign_name' AS incentive_rpc_0_campaign_name,
  trips.incentive_rpc[0]
  ->> 'siret'         AS incentive_rpc_0_siret,
  trips.incentive_rpc[0]
  ->> 'name'          AS incentive_rpc_0_name,
  trips.incentive_rpc[0]
  ->> 'amount'        AS incentive_rpc_0_amount,

  trips.incentive_rpc[1]
  ->> 'campaign_id'   AS incentive_rpc_1_campaign_id,
  trips.incentive_rpc[1]
  ->> 'campaign_name' AS incentive_rpc_1_campaign_name,
  trips.incentive_rpc[1]
  ->> 'siret'         AS incentive_rpc_1_siret,
  trips.incentive_rpc[1]
  ->> 'name'          AS incentive_rpc_1_name,
  trips.incentive_rpc[1]
  ->> 'amount'        AS incentive_rpc_1_amount,

  trips.incentive_rpc[2]
  ->> 'campaign_id'   AS incentive_rpc_2_campaign_id,
  trips.incentive_rpc[2]
  ->> 'campaign_name' AS incentive_rpc_2_campaign_name,
  trips.incentive_rpc[2]
  ->> 'siret'         AS incentive_rpc_2_siret,
  trips.incentive_rpc[2]
  ->> 'name'          AS incentive_rpc_2_name,
  trips.incentive_rpc[2]
  ->> 'amount'        AS incentive_rpc_2_amount

FROM trips
LEFT JOIN geo AS gps ON trips.start_geo_code = gps.arr
LEFT JOIN geo AS gpe ON trips.end_geo_code = gpe.arr
