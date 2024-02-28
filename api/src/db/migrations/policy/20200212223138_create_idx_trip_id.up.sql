DROP INDEX IF EXISTS policy.trips_trip_id_idx;
CREATE INDEX ON policy.trips (trip_id);
