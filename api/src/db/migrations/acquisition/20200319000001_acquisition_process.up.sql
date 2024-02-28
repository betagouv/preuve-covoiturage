-- add new fields to aquisition error
ALTER TABLE acquisition.errors ADD COLUMN error_stage varchar(255) NOT NULL DEFAULT 'acquisition';
ALTER TABLE acquisition.errors ADD COLUMN error_attempt integer NOT NULL DEFAULT 1;
ALTER TABLE acquisition.errors ADD COLUMN error_resolved BOOLEAN NOT NULL DEFAULT FALSE;
