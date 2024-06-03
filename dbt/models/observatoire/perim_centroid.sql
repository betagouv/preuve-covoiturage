{{ config(materialized='view') }}

SELECT
  territory,
  l_territory,
  type,
  year,
  geom
FROM {{ source('geo','perimeters_centroid') }}
UNION
SELECT
  territory,
  l_territory,
  'com' AS type,
  year,
  geom
FROM {{ source('geo','perimeters_centroid') }}
WHERE
  type = 'country'
  AND territory <> 'XXXXX'
