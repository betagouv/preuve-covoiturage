DROP INDEX fraudcheck.fraudchecks_acquisition_id_idx;
DROP INDEX fraudcheck.fraudchecks_created_at_idx;
DROP INDEX fraudcheck.fraudchecks_status_idx;

DROP INDEX fraudcheck.results_acquisition_id_idx;
DROP INDEX fraudcheck.results_uuid_idx;

DROP TRIGGER IF EXISTS touch_fraud_updated_at on fraudcheck.fraudchecks;

DROP TABLE fraudcheck.fraudchecks;
DROP TABLE fraudcheck.results;