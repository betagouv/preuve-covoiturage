ALTER TABLE trip.list ALTER COLUMN operator_journey_id type varchar using operator_journey_id::varchar;

ALTER TABLE trip.list ALTER COLUMN operator_passenger_id type varchar using operator_passenger_id::varchar;

ALTER TABLE trip.list ALTER COLUMN operator_driver_id type varchar using operator_driver_id::varchar;