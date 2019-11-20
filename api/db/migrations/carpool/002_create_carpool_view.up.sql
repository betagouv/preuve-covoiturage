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
