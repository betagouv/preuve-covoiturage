-- add indexes to acquisition.acquisition

DROP INDEX acquisition.acquisitions_operator_id_idx;
DROP INDEX acquisition.acquisitions_journey_id_idx;

-- modify acquisition.errors

DROP INDEX acquisition.errors_journey_id_idx;
DROP INDEX acquisition.errors_request_id_idx;

ALTER TABLE acquisition.errors
  DROP COLUMN journey_id,
  DROP COLUMN request_id;
