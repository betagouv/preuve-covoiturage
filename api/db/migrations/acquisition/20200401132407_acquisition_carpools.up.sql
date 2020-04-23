CREATE OR REPLACE VIEW acquisition.carpools AS (
  SELECT
    acquisition_id,
    operator_id,
    operator_trip_id as journey_id,
    status
  FROM carpool.carpools
  WHERE is_driver = true
  AND operator_trip_id IS NOT NULL
  ORDER BY acquisition_id DESC
);
