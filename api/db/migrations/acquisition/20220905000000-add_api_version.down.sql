ALTER TABLE acquisition.acquisitions DROP COLUMN api_version;
ALTER TABLE acquisition.acquisitions
  DROP COLUMN status;
ALTER TABLE acquisition.acquisitions
  DROP COLUMN error_stage;
ALTER TABLE acquisition.acquisitions
  DROP COLUMN errors;
ALTER TABLE acquisition.acquisitions
  DROP COLUMN request_id;

DROP TYPE acquisition.acquisition_status_enum;
