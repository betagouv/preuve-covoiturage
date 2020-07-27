ALTER TABLE trip.stat_cache
  ALTER COLUMN territory_id TYPE int
  USING territory_id[1]::int;

ALTER TABLE trip.stat_cache
  DROP COLUMN hash;
