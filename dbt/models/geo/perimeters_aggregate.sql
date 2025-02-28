{{ config(
    materialized='incremental',
    unique_key=['year', 'type', 'code'],
    post_hook=[
      'DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '"'perimeters_aggregate_pkey'"') THEN ALTER TABLE {{ this }} ADD CONSTRAINT perimeters_aggregate_pkey PRIMARY KEY (year, type, code); END IF; END $$;'
      'CREATE INDEX IF NOT EXISTS perimeters_aggregate_idx ON {{ this }} using btree(year, type, code)',
    ]
  )
}}

WITH perimeters AS (
  SELECT *
  FROM {{ source('geo','perimeters') }}
  WHERE year >= 2020
)

SELECT
  year,
  'com'       AS type,
  arr         AS code,
  l_arr       AS libelle,
  geom_simple AS geom
FROM perimeters
WHERE
  com IS NOT NULL
{% if is_incremental() %}
    AND year > (SELECT MAX(year) FROM {{ this }})
  {% endif %}
UNION
SELECT
  year,
  'epci'                          AS type,
  epci                            AS code,
  l_epci                          AS libelle,
  ST_MULTI(ST_UNION(geom_simple)) AS geom
FROM perimeters
WHERE
  epci IS NOT NULL
{% if is_incremental() %}
    AND year > (SELECT MAX(year) FROM {{ this }})
  {% endif %}
GROUP BY year, epci, l_epci
UNION
SELECT
  year,
  'aom'                           AS type,
  aom                             AS code,
  l_aom                           AS libelle,
  ST_MULTI(ST_UNION(geom_simple)) AS geom
FROM perimeters
WHERE
  aom IS NOT NULL
{% if is_incremental() %}
    AND year > (SELECT MAX(year) FROM {{ this }})
  {% endif %}
GROUP BY year, aom, l_aom
UNION
SELECT
  year,
  'dep'                           AS type,
  dep                             AS code,
  l_dep                           AS libelle,
  ST_MULTI(ST_UNION(geom_simple)) AS geom
FROM perimeters
WHERE
  dep IS NOT NULL
{% if is_incremental() %}
    AND year > (SELECT MAX(year) FROM {{ this }})
  {% endif %}
GROUP BY year, dep, l_dep
UNION
SELECT
  year,
  'reg'                           AS type,
  reg                             AS code,
  l_reg                           AS libelle,
  ST_MULTI(ST_UNION(geom_simple)) AS geom
FROM perimeters
WHERE
  reg IS NOT NULL
{% if is_incremental() %}
    AND year > (SELECT MAX(year) FROM {{ this }})
  {% endif %}
GROUP BY year, reg, l_reg
UNION
SELECT DISTINCT ON (year, country)
  year,
  'country'                       AS type,
  country                         AS code,
  l_country                       AS libelle,
  ST_MULTI(ST_UNION(geom_simple)) AS geom
FROM perimeters
{% if is_incremental() %}
  WHERE year > (SELECT MAX(year) FROM {{ this }})
{% endif %}
GROUP BY year, country, l_country
