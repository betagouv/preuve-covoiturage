ALTER TABLE carpool.carpools
  DROP COLUMN start_geo_code,
  DROP COLUMN end_geo_code;

DROP INDEX IF EXISTS carpool.carpools_start_geo_code_idx;
DROP INDEX IF EXISTS carpool.carpools_end_geo_code_idx;
