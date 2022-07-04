CREATE INDEX IF NOT EXISTS idx_journey_start_insee ON trip.list (journey_start_insee);
CREATE INDEX IF NOT EXISTS idx_journey_end_insee ON trip.list (journey_end_insee);

DROP INDEX IF EXISTS trip.list_journey_distance_idx;
DROP INDEX IF EXISTS trip.list_driver_id_idx;
DROP INDEX IF EXISTS trip.trip_driver_id_idx;
DROP INDEX IF EXISTS trip.list_journey_start_datetime_idx;
DROP INDEX IF EXISTS trip.list_journey_start_dayhour_idx;
DROP INDEX IF EXISTS trip.idx_journey_start_dayhour;
DROP INDEX IF EXISTS trip.list_journey_start_weekday_idx;
DROP INDEX IF EXISTS trip.idx_journey_start_weekday;
DROP INDEX IF EXISTS trip.list_operator_class_idx;
DROP INDEX IF EXISTS trip.idx_operator_class;
DROP INDEX IF EXISTS trip.idx_operator_id;
DROP INDEX IF EXISTS trip.list_passenger_id_idx;
DROP INDEX IF EXISTS trip.trip_passenger_id_idx;
DROP INDEX IF EXISTS trip.list_applied_policies_idx;
DROP INDEX IF EXISTS trip.list_driver_id_idx;
DROP INDEX IF EXISTS trip.trip_driver_id_idx;




