-- clean up all cache data before migrating the structure
TRUNCATE trip.stat_cache;

-- change territory_id from an integer to an array of integer
ALTER TABLE trip.stat_cache
  ALTER COLUMN territory_id TYPE int[]
  USING array[territory_id]::int[];

-- add a hash column for md5 values
ALTER TABLE trip.stat_cache
  ADD COLUMN hash varchar(32);
