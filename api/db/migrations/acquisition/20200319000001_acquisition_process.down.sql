-- add new fields to aquisition error
ALTER TABLE acquisition.errors DROP COLUMN error_stage;
ALTER TABLE acquisition.errors DROP COLUMN error_attempt;
ALTER TABLE acquisition.errors DROP COLUMN error_resolved;