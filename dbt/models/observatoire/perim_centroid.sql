{{ config(materialized='view') }}

SELECT
  territory,
  l_territory,
  type,
  geom
FROM {{ source('geo','perimeters_centroid') }}
UNION
SELECT
  territory,
  l_territory,
  'com' AS type,
  geom
FROM {{ source('geo','perimeters_centroid') }}
WHERE
  type = 'country'
  AND territory <> 'XXXXX'
