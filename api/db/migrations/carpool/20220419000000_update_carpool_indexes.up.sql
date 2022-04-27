UPDATE carpool.carpools 
SET start_geo_code = sq.start_geo_code,
    end_geo_code = sq.end_geo_code
FROM (
  SELECT
    cco._id as carpool_id,
    tcs.value as start_geo_code,
    tce.value as end_geo_code
  FROM carpool.carpools as cco
  JOIN territory.territory_codes as tcs
    ON tcs.territory_id = cco.start_territory_id
    AND tcs.type = 'insee'
  JOIN territory.territory_codes as tce
    ON tce.territory_id = cco.end_territory_id
    AND tce.type = 'insee'
  WHERE
    cco.start_geo_code IS NULL OR
    cco.end_geo_code IS NULL
) AS sq
WHERE carpools._id = sq.carpool_id;

ALTER TABLE carpool.carpools
  ALTER COLUMN start_geo_code SET NOT NULL,
  ALTER COLUMN end_geo_code SET NOT NULL;

