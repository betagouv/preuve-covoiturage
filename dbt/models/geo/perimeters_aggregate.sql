{{ config(
    materialized='incremental',
    unique_key=['year', 'type', 'code'],
    post_hook=[
      'DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '"'perimeters_aggregate_pkey'"') THEN ALTER TABLE {{ this }} ADD CONSTRAINT perimeters_aggregate_pkey PRIMARY KEY (year, type, code); END IF; END $$;'
      'CREATE INDEX IF NOT EXISTS perimeters_aggregate_idx ON {{ this }} using btree(year, type, code)',
    ]
  )
}}

WITH perimeters as (
  SELECT * 
  FROM {{ source('geo','perimeters') }}
  WHERE year >= 2020
)
SELECT year,
  'com' as type,
  arr as code,
  l_arr as libelle,
  geom_simple as geom
  FROM perimeters
  WHERE com IS NOT NULL
  {% if is_incremental() %}
    AND year > (SELECT MAX(year) FROM {{ this }})
  {% endif %}
UNION
SELECT year, 
  'epci' as type,
  epci as code,
  l_epci as libelle,
  st_multi(st_union(geom_simple)) as geom
  FROM perimeters
  WHERE epci IS NOT NULL
  {% if is_incremental() %}
    AND year > (SELECT MAX(year) FROM {{ this }})
  {% endif %}
  GROUP BY year, epci, l_epci
UNION
SELECT year,
  'aom' as type,
  aom as code,
  l_aom as libelle,
  st_multi(st_union(geom_simple)) as geom
  FROM perimeters
  WHERE aom IS NOT NULL
  {% if is_incremental() %}
    AND year > (SELECT MAX(year) FROM {{ this }})
  {% endif %}
  GROUP BY year,aom,l_aom
UNION
SELECT year,
  'dep' as type,
  dep as code,
  l_dep as libelle,
  st_multi(st_union(geom_simple)) as geom
  FROM perimeters
  WHERE dep IS NOT NULL
  {% if is_incremental() %}
    AND year > (SELECT MAX(year) FROM {{ this }})
  {% endif %}
  GROUP BY year,dep,l_dep
UNION
SELECT year,
  'reg' as type,
  reg as code,
  l_reg as libelle,
  st_multi(st_union(geom_simple)) as geom
  FROM perimeters
  WHERE reg IS NOT NULL
  {% if is_incremental() %}
    AND year > (SELECT MAX(year) FROM {{ this }})
  {% endif %}
  GROUP BY year,reg,l_reg
UNION
SELECT distinct on (year,country) 
  year,
  'country' as type,
  country as code,
  l_country as libelle,
  st_multi(st_union(geom_simple)) as geom
  FROM perimeters
  {% if is_incremental() %}
    WHERE year > (SELECT MAX(year) FROM {{ this }})
  {% endif %}
  GROUP BY year,country,l_country