ALTER TABLE carpool.carpools
  ADD COLUMN start_geo_code varchar(5),
  ADD COLUMN end_geo_code varchar(5);

CREATE INDEX IF NOT EXISTS carpools_start_geo_code_idx ON carpool.carpools (start_geo_code);
CREATE INDEX IF NOT EXISTS carpools_end_geo_code_idx ON carpool.carpools (end_geo_code);
