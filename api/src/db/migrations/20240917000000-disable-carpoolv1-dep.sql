ALTER TABLE policy.incentives ALTER COLUMN carpool_id DROP NOT NULL;
DROP TRIGGER IF EXISTS hydrate_trip_from_policy ON policy.incentives;
DROP TRIGGER IF EXISTS hydrate_trip_from_carpool ON carpool.carpools;
DROP FUNCTION IF EXISTS hydrate_trip_from_carpool();
DROP FUNCTION IF EXISTS hydrate_trip_from_policy();
DROP VIEW IF EXISTS policy.trips;
DROP VIEW IF EXISTS acquisition.carpools;