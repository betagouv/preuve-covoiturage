-- DROP old view
DROP view common.carpools CASCADE;

ALTER TABLE carpool.carpools
  DROP column start_town,
  DROP column end_town,
  DROP column start_territory,
  DROP column end_territory,
  ADD column operator_journey_id varchar,
  ADD column cost integer NOT NULL DEFAULT 0,
  ADD column meta json;

CREATE OR REPLACE VIEW common.carpools AS (
  SELECT * FROM carpool.carpools
);
