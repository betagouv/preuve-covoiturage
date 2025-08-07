{{ 
    config(
    materialized = 'table' if target.name == 'dev' else 'incremental',
    unique_key=[ 'cc_operator_journey_id', 'cc__id'],
    indexes = [
      {
        'columns':[
          'cc_start_datetime'
        ],
      },
      {
        'columns':[
          'cc_operator_journey_id'
        ],
      }
    ]
  )
}}

    SELECT
        -- Timezone-aware start_datetime
        CASE
            WHEN cg.start_geo_code::text ~ '^97[1-2]' THEN cc.start_datetime AT TIME ZONE 'America/Guadeloupe'
            WHEN cg.start_geo_code::text ~ '^973'    THEN cc.start_datetime AT TIME ZONE 'America/Guyana'
            WHEN cg.start_geo_code::text ~ '^974'    THEN cc.start_datetime AT TIME ZONE 'Indian/Reunion'
            WHEN cg.start_geo_code::text ~ '^976'    THEN cc.start_datetime AT TIME ZONE 'Indian/Mayotte'
            ELSE cc.start_datetime AT TIME ZONE 'Europe/Paris'
        END AS tz_start_datetime,

        -- Timezone-aware end_datetime
        CASE
            WHEN cg.end_geo_code::text ~ '^97[1-2]' THEN cc.end_datetime AT TIME ZONE 'America/Guadeloupe'
            WHEN cg.end_geo_code::text ~ '^973'    THEN cc.end_datetime AT TIME ZONE 'America/Guyana'
            WHEN cg.end_geo_code::text ~ '^974'    THEN cc.end_datetime AT TIME ZONE 'Indian/Reunion'
            WHEN cg.end_geo_code::text ~ '^976'    THEN cc.end_datetime AT TIME ZONE 'Indian/Mayotte'
            ELSE cc.end_datetime AT TIME ZONE 'Europe/Paris'
        END AS tz_end_datetime,

        -- Carpool final state
        CASE 
            WHEN cs.acquisition_status IN ('processed', 'failed', 'canceled', 'expired', 'terms_violation_error') THEN TRUE
            ELSE FALSE
        END AS is_final_state,

        -- Carpool valid state
        CASE 
            WHEN cs.acquisition_status = 'processed' 
             AND cs.anomaly_status = 'passed'
             AND cs.fraud_status = 'passed' THEN TRUE
            ELSE FALSE
        END AS is_valid,

        {{ dbt_utils.star(from=source('carpool', 'carpools'), prefix='cc_', relation_alias='cc') }},
        {{ dbt_utils.star(from=source('carpool', 'status'), prefix='cs_', relation_alias='cs') }},
        {{ dbt_utils.star(from=source('carpool', 'geo'), prefix='cg_', relation_alias='cg') }},
        oo._id as oo__id,
        oo.name as oo_name,
        oo.siret as oo_siret,
  
        {{ dbt_utils.star(from=source('geo', 'perimeters'), prefix='ps_', relation_alias='ps') }},
        {{ dbt_utils.star(from=source('geo', 'perimeters'), prefix='pe_', relation_alias='pe') }}

        
    FROM {{ source('carpool', 'carpools') }} cc
    JOIN {{ source('carpool', 'status') }} cs        ON cs.carpool_id = cc._id
    JOIN {{ source('carpool', 'geo') }} cg           ON cg.carpool_id = cc._id
    JOIN {{source('operator', 'operators') }} oo       ON oo._id = cc.operator_id
    LEFT JOIN {{source('geo', 'perimeters') }} ps       ON cg.start_geo_code = ps.arr
                                    AND ps.year = EXTRACT(YEAR FROM cc.start_datetime)::int
    LEFT JOIN {{ source('geo', 'perimeters') }} pe      ON cg.end_geo_code = pe.arr
                                    AND pe.year = EXTRACT(YEAR FROM cc.start_datetime)::int
{% if is_incremental() %}
  WHERE cc.start_datetime::date >= (SELECT MAX(start_date) FROM {{ this }})::date
{% endif %}

{% if target.name == 'dev' %}
LIMIT 5000
{% endif %}