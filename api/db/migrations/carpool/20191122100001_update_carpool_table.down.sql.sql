DROP view common.carpools CASCADE;

ALTER TABLE carpool.carpools
  ADD column start_town varchar,
  ADD column start_territory varchar,
  ADD column end_town varchar,
  ADD column end_territory varchar,
  DROP column operator_journey_id,
  DROP column cost,
  DROP column meta;

CREATE OR REPLACE VIEW common.carpools AS (
  SELECT 
    created_at,
    acquisition_id,
    operator_id,
    trip_id,
    operator_trip_id,
    is_driver,
    operator_class,
    datetime,
    duration,
    start_position,
    start_insee,
    start_town,
    start_territory,
    end_position,
    end_insee,
    end_town,
    end_territory,
    distance,
    seats
  FROM carpool.carpools
);
