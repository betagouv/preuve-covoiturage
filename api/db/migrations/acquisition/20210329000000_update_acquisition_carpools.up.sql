CREATE OR REPLACE VIEW acquisition.carpools AS (
  SELECT
    acquisition_id,
    operator_id,
    operator_journey_id as journey_id,
    operator_trip_id as operator_journey_id,
    status,
    is_driver
  FROM carpool.carpools
  ORDER BY acquisition_id DESC
);
